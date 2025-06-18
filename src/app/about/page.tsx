import { supabase } from '@/lib/supabase'

interface StatsCardProps {
  label: string
  value: number
  isPercentage?: boolean
}

function StatsCard({ label, value, isPercentage = false }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {value}{isPercentage ? '%' : ''}
        </div>
        <div className="text-gray-700 font-medium">{label}</div>
      </div>
    </div>
  )
}

export default async function AboutStatsPage() {
  // Fetch both about and stats data
  const [aboutResult, statsResult] = await Promise.all([
    supabase.from('about').select('*').single(),
    supabase.from('stats').select('*').order('display_order')
  ])

  const { data: aboutData, error: aboutError } = aboutResult
  const { data: statsData, error: statsError } = statsResult

  if (aboutError || statsError) {
    console.error('Database errors:', { aboutError, statsError })
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* About Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">About Our School</h1>
        
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          {aboutData ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  English
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {aboutData.content_en}
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
                  नेपाली
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {aboutData.content_ne}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">
                {aboutError ? `Error: ${aboutError.message}` : 'Loading about content...'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">School Statistics</h2>
        
        {statsData && statsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <StatsCard
                key={stat.id}
                label={stat.label_en}
                value={stat.value}
                isPercentage={stat.label_en.toLowerCase().includes('rate')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-600">
              {statsError ? `Error: ${statsError.message}` : 'Loading statistics...'}
            </p>
          </div>
        )}
      </section>

      {/* Connection Status */}
      <div className="mt-12 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-medium">About Status:</span>{' '}
            <span className={aboutError ? 'text-red-600' : 'text-green-600'}>
              {aboutError ? 'Error' : 'Connected'}
            </span>
          </div>
          <div>
            <span className="font-medium">Stats Status:</span>{' '}
            <span className={statsError ? 'text-red-600' : 'text-green-600'}>
              {statsError ? 'Error' : 'Connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
