import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Get stats for the dashboard
  const [aboutResult, statsResult] = await Promise.all([
    supabase.from('about').select('*').single(),
    supabase.from('stats').select('*').order('display_order')
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">About Content</h3>
                <p className="text-sm text-gray-600">
                  {aboutResult.data ? 'Configured' : 'Not set'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-900">Statistics</h3>
                <p className="text-sm text-gray-600">
                  {statsResult.data?.length || 0} stats configured
                </p>
              </div>
            </div>
          </div>

          {/* CMS Modules */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* About Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">About Content</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage about page content in both languages
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/about">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage About
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Update school statistics and numbers
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/stats">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage Stats
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Teachers Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Teachers</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage teacher profiles and information
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Link href="/admin/teachers">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Manage Teachers
                    </Button>
                  </Link>
                </div>
              </div>

              {/* More modules... */}
              <div className="bg-white overflow-hidden shadow rounded-lg opacity-50">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Notices</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage school notices and announcements
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
