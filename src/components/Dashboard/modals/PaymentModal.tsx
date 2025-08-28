import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { useNotifications } from '../shared/NotificationSystem';
import { CreditCard, DollarSign, Hash, Smartphone } from 'lucide-react';

interface Booking {
  id: string;
  pickupLocation: string;
  destination: string;
  totalPrice: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface PaymentData {
  method: 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'CARD';
  amount: number;
  transactionId?: string;
  phoneNumber?: string;
  notes?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmit: (paymentData: PaymentData) => Promise<void>;
  isLoading?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  isLoading = false
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'WAVE',
    amount: booking?.totalPrice || 0,
    transactionId: '',
    phoneNumber: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotifications();

  // Mettre à jour le montant quand la réservation change
  React.useEffect(() => {
    if (booking) {
      setPaymentData(prev => ({
        ...prev,
        amount: booking.totalPrice
      }));
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.transactionId?.trim()) {
      showError('Erreur de validation', 'L\'ID de transaction est requis');
      return;
    }

    if (paymentData.amount <= 0) {
      showError('Erreur de validation', 'Le montant doit être supérieur à 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(paymentData);
      showSuccess(
        'Paiement enregistré',
        'Le paiement a été enregistré avec succès et la course est maintenant terminée'
      );
      setPaymentData({
        method: 'WAVE',
        amount: 0,
        transactionId: '',
        phoneNumber: '',
        notes: ''
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      showError(
        'Erreur d\'enregistrement',
        error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPaymentData({
          method: 'WAVE',
          amount: booking?.totalPrice || 0,
          transactionId: '',
          phoneNumber: '',
          notes: ''
        });
      onClose();
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'WAVE':
      case 'ORANGE_MONEY':
        return <Smartphone className="h-5 w-5" />;
      case 'CARD':
        return <CreditCard className="h-5 w-5" />;
      case 'CASH':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'WAVE': return 'Wave Money';
      case 'ORANGE_MONEY': return 'Orange Money';
      case 'CARD': return 'Carte bancaire';
      case 'CASH': return 'Espèces';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enregistrer le paiement"
      size="md"
    >
      <div className="space-y-6">
        {/* Informations de la course */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Détails de la course</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>Client:</strong> {booking.user.firstName} {booking.user.lastName}</div>
            <div><strong>Trajet:</strong> {booking.pickupLocation} → {booking.destination}</div>
            <div><strong>Montant:</strong> {formatCurrency(booking.totalPrice)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Moyen de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moyen de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['WAVE', 'ORANGE_MONEY', 'CASH', 'CARD'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentData(prev => ({ ...prev, method }))}
                  className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                    paymentData.method === method
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {getPaymentMethodIcon(method)}
                  <span className="ml-2 text-sm font-medium">
                    {getPaymentMethodLabel(method)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Montant reçu (XOF)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                id="amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Montant en XOF"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          {/* Numéro de téléphone (pour Wave et Orange Money) */}
          {(paymentData.method === 'WAVE' || paymentData.method === 'ORANGE_MONEY') && (
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  value={paymentData.phoneNumber || ''}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: +221 77 123 45 67"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Numéro utilisé pour le paiement {paymentData.method === 'WAVE' ? 'Wave' : 'Orange Money'}
              </p>
            </div>
          )}

          {/* ID de transaction */}
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de transaction
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="transactionId"
                value={paymentData.transactionId || ''}
                onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: TXN123456789 ou Référence du paiement"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Saisissez l'ID de transaction {paymentData.method === 'CASH' ? 'ou une référence interne' : 'fourni par le service de paiement'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              value={paymentData.notes || ''}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Informations supplémentaires sur le paiement..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer le paiement'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;