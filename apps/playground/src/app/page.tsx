import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Zap, Shield, Code } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-bold">BigShip SDK Playground</h1>
            <Badge variant="secondary">v3.0.0</Badge>
          </div>
          <Link href="/playground">
            <Button>Open Playground</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Test the BigShip SDK
            <br />
            <span className="text-muted-foreground">before you integrate</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            An interactive playground to experiment with every feature of the{' '}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded">@agamya/bigship-sdk</code>.
            Create orders, manage warehouses, track shipments, and explore error handling — all from your browser.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/playground">
              <Button size="lg">Get Started</Button>
            </Link>
            <a href="https://github.com/agamya-samuel/bigship-sdk" target="_blank" rel="noopener">
              <Button size="lg" variant="outline">GitHub</Button>
            </a>
            <a href="https://www.npmjs.com/package/@agamya/bigship-sdk" target="_blank" rel="noopener">
              <Button size="lg" variant="outline">NPM</Button>
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">22 SDK Methods</CardTitle>
                <CardDescription>
                  Test every method on BigshipClient — orders, manifests, tracking, rates, warehouses, and more.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Error Playground</CardTitle>
                <CardDescription>
                  Trigger every error class — validation, auth, duplicate invoice, network — and learn type guard patterns.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Code className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Code Generation</CardTitle>
                <CardDescription>
                  Every API call generates copy-pasteable TypeScript SDK code you can drop into your project.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Package className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-base">Live Hooks</CardTitle>
                <CardDescription>
                  Watch SDK lifecycle hooks fire in real-time — onBeforeRequest, onResponse, onError, onRetry.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            <code>@agamya/bigship-sdk</code> — Community SDK for{' '}
            <a href="https://bigship.direct" className="underline" target="_blank" rel="noopener">
              Bigship.direct
            </a>{' '}
            API. Not officially affiliated.
          </p>
        </div>
      </footer>
    </div>
  );
}
