import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Zap,
  Shield,
  Code,
  ArrowRight,
  ExternalLink,
  Terminal,
  Webhook,
} from 'lucide-react';

const proofRequest = `import { BigshipClient } from '@agamya/bigship-sdk';

const client = new BigshipClient({
  baseURL: 'https://api.bigship.direct',
  userName: process.env.BIGSHIP_USER_NAME!,
  password: process.env.BIGSHIP_PASSWORD!,
  accessKey: process.env.BIGSHIP_ACCESS_KEY!,
});

const order = await client.createOrder({
  referenceNo: 'INV-2026-04812',
  orderType: 'B2C',
  customer: { name: 'Priya Shah', phone: '98xxxxxx21' },
  pickup: { warehouseId: 1042 },
  delivery: { pincode: '560001', city: 'Bengaluru' },
  items: [{ name: 'Wool scarf', qty: 1, value: 1899 }],
});`;

const proofResponse = `{
  "status": true,
  "data": {
    "orderId": 884_211_039,
    "awbNumber": "BSID26-04812",
    "courierPartner": "Delhivery Surface",
    "estimatedDelivery": "2026-09-13",
    "walletBalanceAfter": 12_845.50
  },
  "requestId": "req_01HZX4M0F3Q8YKJ2VBNT6"
}`;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Skip to main content
      </a>
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Package className="h-6 w-6 shrink-0" aria-hidden />
            <h1 className="text-base sm:text-xl font-bold truncate">BigShip Playground</h1>
            <Badge variant="secondary" className="hidden xs:inline-flex shrink-0">
              v4.0.0
            </Badge>
          </div>
          <nav className="flex items-center gap-2 shrink-0">
            <a
              href="https://github.com/agamya-samuel/bigship-sdk"
              target="_blank"
              rel="noopener"
              className="hidden sm:inline-flex min-h-[44px] items-center"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                GitHub
              </Button>
            </a>
            <Link href="/playground" className="inline-flex min-h-[44px] items-center">
              <Button size="sm">
                <span className="xs:inline">Open </span>Playground
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero — asymmetric: pitch left, live proof panel right */}
        <section className="container mx-auto px-4 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-stretch">
            <div className="md:col-span-5 md:pt-4 lg:pt-6 flex flex-col">
              <Badge
                variant="outline"
                className="mb-5 gap-1.5 self-start"
                title="SDK connects api.bigship.direct"
              >
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Connected to api.bigship.direct
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
                Ship the API.
                <br />
                Skip the postman.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-7 max-w-xl">
                Type a call. See the typed response.
                <br />
                Every{' '}
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground break-all">
                  @agamya/bigship-sdk
                </code>{' '}
                method, every error class, every lifecycle hook — exercised in your browser before
                you touch your codebase.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link href="/playground" className="inline-flex min-h-[44px] items-center">
                  <Button size="lg" className="w-full sm:w-auto">
                    Open Playground
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="https://www.npmjs.com/package/@agamya/bigship-sdk"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-[44px] items-center"
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Terminal className="mr-2 h-4 w-4" />
                    npm i @agamya/bigship-sdk
                  </Button>
                </a>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
                <div>
                  <dt className="text-2xl font-bold tabular-nums">22</dt>
                  <dd className="text-xs text-muted-foreground leading-tight mt-1">
                    SDK methods
                  </dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold tabular-nums">16</dt>
                  <dd className="text-xs text-muted-foreground leading-tight mt-1">
                    API endpoints
                  </dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold tabular-nums">0</dt>
                  <dd className="text-xs text-muted-foreground leading-tight mt-1">
                    hand-written HTTP calls
                  </dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-7 min-w-0">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40 gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400/70" />
                    <span className="ml-2 text-xs font-medium text-muted-foreground truncate">
                      createOrder.ts — live request
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
                    POST /api/createOrder
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-w-0">
                  <div className="border-b md:border-b-0 md:border-e min-w-0">
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
                      Request
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono min-w-0 max-h-[420px]">
                      <code>{proofRequest}</code>
                    </pre>
                  </div>
                  <div className="min-w-0">
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b flex items-center justify-between gap-2">
                      <span>Response</span>
                      <span className="font-mono normal-case tracking-normal text-emerald-600">
                        200 OK · 187ms
                      </span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono min-w-0 max-h-[420px]">
                      <code>{proofResponse}</code>
                    </pre>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-t bg-muted/40 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Webhook className="h-3.5 w-3.5 shrink-0" />
                    onRequest → onResponse → onRetry
                  </span>
                  <span className="ml-auto flex items-center gap-3 min-w-0">
                    <span className="font-mono text-muted-foreground truncate hidden sm:inline">
                      req_01HZX4M0F3Q8YKJ2VBNT6
                    </span>
                    <Link
                      href="/playground"
                      aria-label="Run this request yourself in the playground"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium whitespace-nowrap rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Run it yourself
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quickstart strip — break the rhythm, signal install */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              Zero to first shipment
            </span>
            <code className="flex-1 min-w-0 font-mono text-xs sm:text-sm bg-background border rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap">
              npm install @agamya/bigship-sdk
            </code>
            <Link
              href="/playground/reference"
              className="text-sm text-primary hover:underline font-medium whitespace-nowrap self-start sm:self-auto min-h-[44px] inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span aria-hidden>See every method</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              <span className="sr-only"> — open the BigShip SDK method index</span>
            </Link>
          </div>
        </section>

        {/* Video demo — relocated into its own lane with breathing room */}
        <section className="container mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="md:col-span-4">
              <Badge variant="outline" className="mb-4">
                Walkthrough
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                Two minutes from{' '}
                <code className="font-mono text-primary">npm install</code> to first AWB.
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Watch a full B2C flow: credential gate, create order, manifest, finalize, track —
                every step a real API call against api.bigship.direct.
              </p>
            </div>
            <div className="md:col-span-8 min-w-0">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <video
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video"
                >
                  <source
                    src="https://cdn-r2.agamya.dev/bigship/bigship-sdk-playground-demo.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Features — one dominant card + three supporting tiles (deliberate hierarchy) */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="mb-10 sm:mb-12 max-w-2xl">
            <Badge variant="outline" className="mb-4">
              What's inside
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
              One playground, every surface of the SDK.
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              The same surface ships the method index, the error catalog, generated code snippets,
              and live hook observability — no tab-switching, no separate tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Dominant card: method coverage */}
            <Link
              href="/playground/reference"
              aria-label="Browse the BigShip SDK method index"
              className="group/link md:col-span-2 lg:col-span-7 lg:row-span-1 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full border-2 transition-colors group-hover/link:border-primary group-focus-visible/link:border-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Zap className="h-7 w-7 text-primary" aria-hidden />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        22 / 22
                      </Badge>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover/link:translate-x-0.5 group-focus-visible/link:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl mt-3 leading-tight">
                    Every method on{' '}
                    <code className="font-mono text-primary">BigshipClient</code>, indexed
                  </CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base pt-1">
                    From{' '}
                    <code className="font-mono text-foreground">getWalletBalance</code> to{' '}
                    <code className="font-mono text-foreground">manifestAndGetAWB</code> —
                    every endpoint in the Bigship API, grouped by workflow, with editable
                    forms pre-filled from real data.
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs font-mono text-muted-foreground">
                    <span>auth.login</span>
                    <span>order.create</span>
                    <span>rate.calculate</span>
                    <span>order.cancel</span>
                    <span>warehouse.list</span>
                    <span>tracking.status</span>
                    <span>manifest.generate</span>
                    <span>shipment.finalize</span>
                    <span className="text-foreground font-semibold">+ 13 more</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Error playground */}
            <Link
              href="/playground/errors"
              aria-label="Open the BigShip error playground"
              className="group/link lg:col-span-5 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full transition-colors group-hover/link:border-primary group-focus-visible/link:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Shield className="h-6 w-6 text-primary" aria-hidden />
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover/link:translate-x-0.5 group-focus-visible/link:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-base sm:text-lg mt-3 leading-tight">
                    The full error catalog
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Trigger validation, duplicate invoice, auth, and network failures on
                    demand. Each error exposes the typing guard your production code should
                    use.
                  </p>
                </CardHeader>
              </Card>
            </Link>

            {/* Code generation */}
            <Link
              href="/playground/orders"
              aria-label="Try a BigShip SDK code snippet"
              className="group/link lg:col-span-5 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full transition-colors group-hover/link:border-primary group-focus-visible/link:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Code className="h-6 w-6 text-primary" aria-hidden />
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover/link:translate-x-0.5 group-focus-visible/link:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-base sm:text-lg mt-3 leading-tight">
                    Drop-in TypeScript snippets
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Every call you run in the playground rewrites itself as copy-pasteable
                    SDK code — no boilerplate, no manual translation.
                  </p>
                </CardHeader>
              </Card>
            </Link>

            {/* Live hooks */}
            <Link
              href="/playground/hooks"
              aria-label="Watch BigShip SDK lifecycle hooks live"
              className="group/link md:col-span-2 lg:col-span-7 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full transition-colors group-hover/link:border-primary group-focus-visible/link:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Webhook className="h-6 w-6 text-primary" aria-hidden />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        onBefore · onResponse · onError · onRetry
                      </Badge>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover/link:translate-x-0.5 group-focus-visible/link:translate-x-0.5"
                        aria-hidden
                      />
                    </div>
                  </div>
                  <CardTitle className="text-base sm:text-lg mt-3 leading-tight">
                    Lifecycle hooks fire in real time
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Watch each hook stamp its payload as your request travels through the SDK
                    — the easiest way to instrument retries, logging, and telemetry.
                  </p>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>
            <code>@agamya/bigship-sdk</code> — Community SDK for{' '}
            <a
              href="https://bigship.direct"
              className="underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bigship.direct
            </a>{' '}
            API. Not officially affiliated.
          </p>
        </div>
      </footer>
    </div>
  );
}
