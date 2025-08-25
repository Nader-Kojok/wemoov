import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const BrandGuidelines = () => {
  const colorPalette = [
    {
      name: 'Wemoov Blue',
      hex: '#1E5EFF',
      description: 'Primary brand color - vibrant and energetic',
      usage: 'Primary buttons, links, brand elements'
    },
    {
      name: 'Wemoov Dark',
      hex: '#2D2D2D',
      description: 'Dark charcoal for text and contrast',
      usage: 'Headlines, body text, dark backgrounds'
    },
    {
      name: 'Light Purple',
      hex: '#B8C5FF',
      description: 'Soft accent color derived from brand blue',
      usage: 'Secondary elements, highlights, backgrounds'
    },
    {
      name: 'Light Blue',
      hex: '#E8EFFF',
      description: 'Very light blue for subtle backgrounds',
      usage: 'Card backgrounds, subtle sections'
    },
    {
      name: 'Pure White',
      hex: '#FFFFFF',
      description: 'Clean white for contrast and space',
      usage: 'Backgrounds, cards, text on dark'
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            Wemoov<span className="text-primary">.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Brand Guidelines & Design System
          </p>
          <p className="text-muted-foreground">
            A comprehensive guide to Wemoov's visual identity, colors, and design principles
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Color Palette</h2>
            <p className="text-muted-foreground">Our brand colors reflect energy, trust, and innovation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colorPalette.map((color, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="h-32 w-full cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                  title="Click to copy hex code"
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{color.name}</CardTitle>
                  <CardDescription className="font-mono text-sm">
                    {color.hex}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{color.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {color.usage}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Typography</h2>
            <p className="text-muted-foreground">Clean, modern typography for optimal readability</p>
          </div>
          
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Heading 1</h1>
                <p className="text-sm text-muted-foreground font-mono">text-4xl font-bold</p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-foreground mb-2">Heading 2</h2>
                <p className="text-sm text-muted-foreground font-mono">text-3xl font-semibold</p>
              </div>
              <div>
                <h3 className="text-2xl font-medium text-foreground mb-2">Heading 3</h3>
                <p className="text-sm text-muted-foreground font-mono">text-2xl font-medium</p>
              </div>
              <div>
                <p className="text-base text-foreground mb-2">
                  Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-sm text-muted-foreground font-mono">text-base</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Small text - Perfect for captions, labels, and secondary information.
                </p>
                <p className="text-sm text-muted-foreground font-mono">text-sm text-muted-foreground</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Component Examples */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Component Examples</h2>
            <p className="text-muted-foreground">UI components using our brand colors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles with brand colors</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Brand Usage */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Brand Usage</h2>
            <p className="text-muted-foreground">Guidelines for using the Wemoov brand</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-primary text-primary-foreground">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-primary-foreground">Primary Brand Color</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-primary-foreground/90">
                  Use Wemoov Blue (#1E5EFF) for primary actions, brand elements, and key interactive components.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-secondary">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Secondary Colors</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-secondary-foreground/90">
                  Light Purple (#B8C5FF) works beautifully for secondary elements and subtle highlights.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            Wemoov Brand Guidelines • Design System v1.0
          </p>
        </footer>
      </div>
    </div>
  )
}

export default BrandGuidelines