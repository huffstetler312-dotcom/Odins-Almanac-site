import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Square, Circle, ExternalLink } from "lucide-react";

export default function POSSetupGuide() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">POS Integration Setup Guide</h1>
        <p className="text-muted-foreground">
          Complete instructions for integrating Square, Toast, Clover, and Lightspeed POS systems
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6" data-testid="tabs-pos-setup">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="square" data-testid="tab-square">Square</TabsTrigger>
          <TabsTrigger value="toast" data-testid="tab-toast">Toast</TabsTrigger>
          <TabsTrigger value="clover" data-testid="tab-clover">Clover</TabsTrigger>
          <TabsTrigger value="lightspeed" data-testid="tab-lightspeed">Lightspeed</TabsTrigger>
          <TabsTrigger value="deployment" data-testid="tab-deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported POS Systems</CardTitle>
              <CardDescription>
                Our system integrates with major POS providers for real-time inventory sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Square POS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    API endpoint, OAuth authentication, real-time webhooks
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Toast POS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    REST API integration, automated sales sync
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Clover POS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Merchant API, inventory updates, sales tracking
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Lightspeed POS
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    JSON API, batch sync, historical data import
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Integration Benefits</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    Automatic inventory deduction when items are sold
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    Real-time sales data for P&L calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    Multi-location support with distributed sync
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    Variance detection and theft prevention
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="square" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Square POS Integration</CardTitle>
              <CardDescription>Step-by-step setup for Square integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Create Square Developer Account</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Visit <a href="https://developer.squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">developer.squareup.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Sign up for a developer account (free)</li>
                  <li>Create a new application in the Square Developer Dashboard</li>
                  <li>Note your Application ID and Access Token</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: Configure API Credentials</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>
                    <Badge variant="outline">Endpoint</Badge>
                    <p className="mt-1">https://connect.squareup.com</p>
                  </div>
                  <div>
                    <Badge variant="outline">API Version</Badge>
                    <p className="mt-1">v2</p>
                  </div>
                  <div>
                    <Badge variant="outline">Required Permissions</Badge>
                    <p className="mt-1">ITEMS_READ, INVENTORY_READ, ORDERS_READ</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 3: Add Integration in App</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Navigate to POS Integrations page in the app</li>
                  <li>Click "Add POS System" and select "Square"</li>
                  <li>Enter your Access Token and Location ID</li>
                  <li>Test the connection</li>
                  <li>Enable auto-sync (recommended: every 5 minutes)</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 4: Map Inventory Items</h3>
                <p className="text-sm text-muted-foreground">
                  Map your Square catalog items to your inventory items for accurate tracking. The system will automatically match items by name, or you can manually map them.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toast POS Integration</CardTitle>
              <CardDescription>Step-by-step setup for Toast integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Access Toast Developer Portal</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Visit <a href="https://dev.toasttab.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">dev.toasttab.com <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Sign in with your Toast restaurant credentials</li>
                  <li>Navigate to "Integrations" → "API Access"</li>
                  <li>Generate a new API token</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: API Configuration</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>
                    <Badge variant="outline">Endpoint</Badge>
                    <p className="mt-1">https://ws-api.toasttab.com</p>
                  </div>
                  <div>
                    <Badge variant="outline">Authentication</Badge>
                    <p className="mt-1">Bearer Token (JWT)</p>
                  </div>
                  <div>
                    <Badge variant="outline">Required Scopes</Badge>
                    <p className="mt-1">menus:read, orders:read, inventory:read</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 3: Configure Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Set up webhooks for real-time updates when orders are placed:
                </p>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  Webhook URL: https://yourapp.replit.app/api/webhooks/toast
                </div>
                <p className="text-sm text-muted-foreground">
                  Subscribe to: order.created, inventory.updated events
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clover POS Integration</CardTitle>
              <CardDescription>Step-by-step setup for Clover integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Clover Developer Account</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://www.clover.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">clover.com/developers <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Create a developer account</li>
                  <li>Create a new app in the Clover App Market</li>
                  <li>Configure permissions for inventory and orders</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: API Setup</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>
                    <Badge variant="outline">Endpoint</Badge>
                    <p className="mt-1">https://api.clover.com/v3</p>
                  </div>
                  <div>
                    <Badge variant="outline">Authentication</Badge>
                    <p className="mt-1">OAuth 2.0</p>
                  </div>
                  <div>
                    <Badge variant="outline">Permissions</Badge>
                    <p className="mt-1">MERCHANT_R, ORDERS_R, INVENTORY_R</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 3: Connect Merchant Account</h3>
                <p className="text-sm text-muted-foreground">
                  Use OAuth flow to connect your Clover merchant account. The app will guide you through the authorization process.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lightspeed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lightspeed POS Integration</CardTitle>
              <CardDescription>Step-by-step setup for Lightspeed integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Lightspeed API Access</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Visit <a href="https://cloud.lightspeedapp.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">cloud.lightspeedapp.com/developers <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Sign in with your Lightspeed account</li>
                  <li>Create API credentials in Account Settings</li>
                  <li>Generate API key and secret</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: Configuration</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>
                    <Badge variant="outline">Endpoint</Badge>
                    <p className="mt-1">https://api.lightspeedapp.com/API/Account/[AccountID]</p>
                  </div>
                  <div>
                    <Badge variant="outline">Authentication</Badge>
                    <p className="mt-1">API Key + Secret</p>
                  </div>
                  <div>
                    <Badge variant="outline">Data Format</Badge>
                    <p className="mt-1">JSON</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 3: Sync Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure sync intervals and data mapping. Lightspeed supports batch imports for historical data and real-time updates via API polling.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Deployment</CardTitle>
              <CardDescription>Deploy to iOS and Android app stores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Apple Developer Account ($99/year) - for iOS</li>
                  <li>Google Play Developer Account ($25 one-time) - for Android</li>
                  <li>Expo/EAS account (free)</li>
                  <li>Node.js 18+ installed</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Initial Setup</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="text-muted-foreground"># Login to Expo/EAS</div>
                  <div>npx eas login</div>
                  <div className="mt-3 text-muted-foreground"># Configure build</div>
                  <div>npx eas build:configure</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: Build for iOS</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="text-muted-foreground"># Build for production</div>
                  <div>npx eas build --platform ios --profile production</div>
                  <div className="mt-3 text-muted-foreground"># Submit to App Store</div>
                  <div>npx eas submit --platform ios --latest</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Build takes 10-15 minutes. No Mac required!
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 3: Build for Android</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div className="text-muted-foreground"># Build for production</div>
                  <div>npx eas build --platform android --profile production</div>
                  <div className="mt-3 text-muted-foreground"># Submit to Play Store</div>
                  <div>npx eas submit --platform android --latest</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Step 4: App Store Submission</h3>
                <p className="text-sm text-muted-foreground">
                  After building, you'll receive download links for your app binaries. Upload these to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">App Store Connect</a> for iOS</li>
                  <li><a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Console</a> for Android</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Timeline</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build process:</span>
                    <Badge variant="outline">10-15 minutes</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">iOS review:</span>
                    <Badge variant="outline">1-7 days</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Android review:</span>
                    <Badge variant="outline">1-3 days</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Web App Publishing (Replit)</CardTitle>
              <CardDescription>Deploy your web application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Publishing to Replit</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Click "Publish" button at top of Replit workspace</li>
                  <li>Choose deployment type (Autoscale recommended)</li>
                  <li>Configure custom domain (optional)</li>
                  <li>Enable "Private Deployment" for restricted access</li>
                  <li>Click "Publish" to deploy</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Your App Will Be Live At:</h3>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  https://yourapp.replit.app
                </div>
                <p className="text-xs text-muted-foreground">
                  Or use a custom domain like: yourrestaurant.com
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
