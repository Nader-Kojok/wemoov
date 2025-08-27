import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Info
} from 'lucide-react';

interface BackupFile {
  name: string;
  size: string;
  created: string;
  path: string;
  type?: string;
}

interface BackupResponse {
  success: boolean;
  message?: string;
  data?: {
    message?: string;
    backup?: {
      filename: string;
      size: string;
      path: string;
      type?: string;
      records?: {
        users: number;
        drivers: number;
        vehicles: number;
        bookings: number;
        payments: number;
        services: number;
      };
    };
    restored?: {
      filename: string;
      restoredAt: string;
      counts?: {
        users: number;
        drivers: number;
        vehicles: number;
        bookings: number;
        payments: number;
        services: number;
      };
      totalRecords?: number;
    };
    backups?: BackupFile[];
    count?: number;
    downloadUrl?: string;
    info?: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

const DatabaseManagement: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [showJsonUpload, setShowJsonUpload] = useState(false);

  // Fetch available backups on component mount
  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/database/backups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: BackupResponse = await response.json();
        if (data.success && data.data?.backups) {
          setBackups(data.data.backups);
        }
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des sauvegardes' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/database/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: BackupResponse = await response.json();

      if (data.success) {
        const backup = data.data?.backup;
        let successMessage = `Sauvegarde créée avec succès: ${backup?.filename} (${backup?.size} MB)`;
        
        // If it's a JSON backup with download URL, offer download
        if (backup?.type === 'json' && data.data?.downloadUrl) {
          successMessage += ' - Téléchargement automatique démarré';
          
          // Trigger download
          const link = document.createElement('a');
          link.href = data.data.downloadUrl;
          link.download = backup.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        setMessage({ 
          type: 'success', 
          text: successMessage
        });
        // Refresh the backups list
        await fetchBackups();
      } else {
        setMessage({ type: 'error', text: data.error?.message || data.message || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Backup error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion lors de la sauvegarde' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup && !jsonFile) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une sauvegarde à restaurer ou télécharger un fichier JSON' });
      return;
    }

    setIsRestoring(true);
    setMessage(null);
    setShowRestoreConfirm(false);

    try {
      const token = localStorage.getItem('token');
      let requestBody: any = {};
      
      if (jsonFile) {
        // Handle JSON file upload
        const fileContent = await jsonFile.text();
        const jsonData = JSON.parse(fileContent);
        requestBody = { backupData: jsonData };
      } else {
        // Handle selected backup file
        requestBody = { backupFile: selectedBackup };
      }
      
      const response = await fetch('/api/dashboard/database/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data: BackupResponse = await response.json();

      if (data.success) {
        const restored = data.data?.restored;
        let successMessage = 'Base de données restaurée avec succès.';
        
        if (restored?.counts) {
          const counts = restored.counts;
          successMessage += ` Restauré: ${counts.users} utilisateurs, ${counts.drivers} chauffeurs, ${counts.vehicles} véhicules, ${counts.bookings} réservations, ${counts.payments} paiements, ${counts.services} services.`;
        }
        
        setMessage({ 
          type: 'success', 
          text: successMessage
        });
        setSelectedBackup('');
        setJsonFile(null);
        setShowJsonUpload(false);
      } else {
        setMessage({ type: 'error', text: data.error?.message || data.message || 'Erreur lors de la restauration' });
      }
    } catch (error) {
      console.error('Restore error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion lors de la restauration' });
    } finally {
      setIsRestoring(false);
    }
  };
  
  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setJsonFile(file);
      setSelectedBackup(''); // Clear selected backup when JSON file is chosen
      setMessage({ type: 'info', text: `Fichier JSON sélectionné: ${file.name}` });
    } else {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier JSON valide' });
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la sauvegarde "${backupName}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/database/backups/${encodeURIComponent(backupName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: BackupResponse = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Sauvegarde supprimée avec succès' });
        await fetchBackups();
        if (selectedBackup === backupName) {
          setSelectedBackup('');
        }
      } else {
        setMessage({ type: 'error', text: data.error?.message || data.message || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion lors de la suppression' });
    }
  };

  const formatFileSize = (sizeStr: string) => {
    const size = parseFloat(sizeStr);
    if (size < 1) {
      return `${(size * 1024).toFixed(0)} KB`;
    }
    return `${size.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de la Base de Données</h1>
            <p className="text-gray-600">Sauvegarde et restauration de votre base de données WeMoov</p>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start">
              {message.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />}
              {message.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />}
              {message.type === 'info' && <Info className="h-5 w-5 text-blue-400 mt-0.5" />}
              <div className="ml-3">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackup}
            disabled={isBackingUp || isRestoring}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBackingUp ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            {isBackingUp ? 'Sauvegarde en cours...' : 'Créer une Sauvegarde'}
          </button>

          <button
            onClick={() => setShowRestoreConfirm(true)}
            disabled={(!selectedBackup && !jsonFile) || isBackingUp || isRestoring}
            className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRestoring ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Upload className="h-5 w-5 mr-2" />
            )}
            {isRestoring ? 'Restauration en cours...' : 'Restaurer la Base de Données'}
          </button>

          <button
            onClick={() => setShowJsonUpload(!showJsonUpload)}
            disabled={isBackingUp || isRestoring}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Télécharger JSON
          </button>

          <button
            onClick={fetchBackups}
            disabled={isLoading || isBackingUp || isRestoring}
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* JSON Upload Section */}
      {showJsonUpload && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Restaurer depuis un fichier JSON</h2>
            <p className="text-sm text-gray-600 mt-1">
              Téléchargez un fichier de sauvegarde JSON pour restaurer votre base de données
            </p>
          </div>
          
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              
              {jsonFile ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Fichier sélectionné: {jsonFile.name}
                        </p>
                        <p className="text-sm text-green-700">
                          Taille: {(jsonFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setJsonFile(null);
                        setMessage(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => setShowRestoreConfirm(true)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Restaurer ce fichier
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">Sélectionnez un fichier JSON de sauvegarde</p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJsonFileChange}
                    className="hidden"
                    id="json-upload"
                  />
                  <label
                    htmlFor="json-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir un fichier JSON
                  </label>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Information :</strong> La restauration JSON remplacera TOUTES les données actuelles de la base de données. 
                Assurez-vous d'avoir une sauvegarde récente avant de procéder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sauvegardes Disponibles</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sélectionnez une sauvegarde pour la restaurer ou la supprimer
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Chargement des sauvegardes...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {message?.text?.includes('serverless') 
                  ? 'Mode Serverless Détecté' 
                  : 'Aucune sauvegarde disponible'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {message?.text?.includes('serverless')
                  ? 'En mode serverless, les sauvegardes sont téléchargées directement au format JSON'
                  : 'Créez votre première sauvegarde en cliquant sur le bouton ci-dessus'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBackup === backup.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBackup(backup.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="backup"
                        checked={selectedBackup === backup.name}
                        onChange={() => setSelectedBackup(backup.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{backup.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {backup.created}
                          </span>
                          <span>{formatFileSize(backup.size)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBackup(backup.name);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer cette sauvegarde"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmer la Restauration</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                {jsonFile 
                  ? 'Êtes-vous sûr de vouloir restaurer la base de données avec le fichier JSON :'
                  : 'Êtes-vous sûr de vouloir restaurer la base de données avec la sauvegarde :'
                }
              </p>
              <p className="font-medium text-gray-900 bg-gray-100 p-2 rounded">
                {jsonFile ? jsonFile.name : selectedBackup}
              </p>
              {jsonFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Taille: {(jsonFile.size / 1024).toFixed(2)} KB
                </p>
              )}
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm text-orange-800">
                  <strong>⚠️ Attention :</strong> Cette action remplacera TOUTES les données actuelles de la base de données. Cette opération est irréversible.
                  {jsonFile && ' Le fichier JSON sera analysé et toutes les tables seront recréées avec les données du fichier.'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Confirmer la Restauration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Informations Importantes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les sauvegardes sont créées au format PostgreSQL (.bak)</li>
              <li>• La restauration remplace complètement les données existantes</li>
              <li>• Il est recommandé de créer une sauvegarde avant toute restauration</li>
              <li>• Les sauvegardes incluent la structure et les données de toutes les tables</li>
              <li>• Seuls les administrateurs peuvent effectuer ces opérations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;