'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, CheckCircle, XCircle, Info, Server } from 'lucide-react'

interface EnvironmentInfo {
  isProduction: boolean
  hasToken: boolean
  tokenType: string
  environment: string
  maskedToken?: string | null
  appUrl?: string
}
export async function GET() {
  console.warn('=== ENVIRONMENT DEBUG ===')
  console.warn('NODE_ENV:', process.env.NODE_ENV)
  console.warn('TEST_DEBUG:', process.env.TEST_DEBUG)
  console.warn('POSTMARK_API_TOKEN exists:', !!process.env.POSTMARK_API_TOKEN)
  console.warn(
    'POSTMARK_API_TOKEN value length:',
    process.env.POSTMARK_API_TOKEN?.length
  )
  console.warn(
    'All env vars with POSTMARK:',
    Object.keys(process.env).filter((k) => k.includes('POSTMARK'))
  )
  console.warn(
    'All env vars with TEST:',
    Object.keys(process.env).filter((k) => k.includes('TEST'))
  )

  return Response.json({
    message: 'Debug test',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      testDebug: process.env.TEST_DEBUG,
      hasPostmark: !!process.env.POSTMARK_API_TOKEN,
      postmarkLength: process.env.POSTMARK_API_TOKEN?.length,
    },
  })
}

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [environmentInfo, setEnvironmentInfo] =
    useState<EnvironmentInfo | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  // Fetch environment status on component mount
  useEffect(() => {
    const fetchEnvironmentStatus = async () => {
      try {
        const res = await fetch('/api/test-email')
        const data = await res.json()
        setEnvironmentInfo(data.environment)
      } catch (error) {
        console.error('Failed to fetch environment status:', error)
      } finally {
        setStatusLoading(false)
      }
    }

    fetchEnvironmentStatus()
  }, [])

  const sendTestEmail = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email }),
      })

      const data = await res.json()
      setResponse(data)

      // Update environment info if included in response
      if (data.environment) {
        setEnvironmentInfo(data.environment)
      }
    } catch (err: any) {
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const getEnvironmentBadge = (env: EnvironmentInfo) => {
    if (env.isProduction) {
      return (
        <Badge variant="destructive" className="ml-2">
          PRODUCTION
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
          DEVELOPMENT
        </Badge>
      )
    }
  }

  const getTokenStatusBadge = (env: EnvironmentInfo) => {
    if (env.hasToken) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          ✅ Token Configured
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          ❌ Token Missing
        </Badge>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Environment Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Environment Status
              {environmentInfo && getEnvironmentBadge(environmentInfo)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking environment status...</span>
              </div>
            ) : environmentInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Environment</p>
                    <p className="text-sm text-gray-600">
                      {environmentInfo.environment}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expected Token</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {environmentInfo.tokenType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">App URL</p>
                    <p className="text-sm text-gray-600">
                      {environmentInfo.appUrl || 'Not configured'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Masked Token</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {environmentInfo.maskedToken || 'None'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Token Status:</span>
                  {getTokenStatusBadge(environmentInfo)}
                </div>
                {environmentInfo.isProduction && !environmentInfo.hasToken && (
                  <Alert className="border-red-500 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>
                        ❌ CRITICAL: Production is missing POSTMARK_API_TOKEN.
                      </strong>
                      <br />
                      Emails will NOT be sent. Add your Server API Token in
                      production environment variables.
                    </AlertDescription>
                  </Alert>
                )}
                {!environmentInfo.isProduction && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Development Mode:</strong> All emails sent will be
                      test emails only. Production email reputation is
                      protected.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load environment status. Check console for errors.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Email Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Postmark Email Test
            </CardTitle>
            <CardDescription>
              Test email delivery to debug activation email issues
              {environmentInfo && (
                <span className="block mt-1">
                  Currently using:{' '}
                  <span className="font-mono text-xs">
                    {environmentInfo.tokenType}
                  </span>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={!email || loading || !environmentInfo?.hasToken}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>

            {!environmentInfo?.hasToken && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error!</strong> Postmark token not configured for{' '}
                  {environmentInfo?.environment || 'current'} environment.
                  <div className="mt-2 text-sm">
                    <p>
                      Expected environment variable:{' '}
                      <code className="bg-red-100 px-1 rounded">
                        {environmentInfo?.tokenType}
                      </code>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {response && (
              <div className="space-y-4">
                {response.success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> Test email sent successfully
                      from {response.environment?.environment || 'unknown'}{' '}
                      environment.
                      {response.result && (
                        <div className="mt-2 text-sm space-y-1">
                          <p>
                            <strong>Message ID:</strong>{' '}
                            {response.result.messageId}
                          </p>
                          <p>
                            <strong>To:</strong> {response.result.to}
                          </p>
                          <p>
                            <strong>From:</strong> {response.result.from}
                          </p>
                          <p>
                            <strong>Subject:</strong> {response.result.subject}
                          </p>
                          {response.environment && (
                            <p>
                              <strong>Environment:</strong>{' '}
                              {response.environment.environment}
                            </p>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Error!</strong> {response.error}
                      {response.environment && (
                        <p className="mt-1">
                          <strong>Environment:</strong>{' '}
                          {response.environment.environment}
                        </p>
                      )}
                      {response.missingToken && (
                        <p className="mt-1">
                          <strong>Missing Token:</strong>{' '}
                          <code className="bg-red-100 px-1 rounded">
                            {response.missingToken}
                          </code>
                        </p>
                      )}
                      {response.details && (
                        <div className="mt-2 text-sm">
                          {response.details.code && (
                            <p>
                              <strong>Error Code:</strong>{' '}
                              {response.details.code}
                            </p>
                          )}
                          {response.details.statusCode && (
                            <p>
                              <strong>Status Code:</strong>{' '}
                              {response.details.statusCode}
                            </p>
                          )}
                          {response.details.recipients && (
                            <p>
                              <strong>Inactive Recipients:</strong>{' '}
                              {response.details.recipients.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Full Response:</h4>
                  <pre className="text-xs overflow-auto max-h-64">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <h4 className="font-medium">What this test checks:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Postmark API token is correctly configured for{' '}
                  {environmentInfo?.environment || 'current'} environment
                </li>
                <li>Domain verification is working</li>
                <li>Email delivery is functioning</li>
                <li>Environment detection is working properly</li>
                <li>
                  {environmentInfo?.isProduction ? 'Production' : 'Development'}{' '}
                  email server connectivity
                </li>
              </ul>

              {environmentInfo && !environmentInfo.isProduction && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Development Mode:</strong> This will use the
                    development Postmark server and won't affect your production
                    email reputation.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
