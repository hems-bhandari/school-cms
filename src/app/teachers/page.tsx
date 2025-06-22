import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import Image from 'next/image'

type Teacher = Database['public']['Tables']['teachers']['Row']

interface TeacherCardProps {
  teacher: Teacher
}

function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {teacher.photo_url ? (
          <Image
            src={teacher.photo_url}
            alt={teacher.name_en}
            width={300}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-semibold">
              {teacher.name_en.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {teacher.name_en}
          </h3>
          <p className="text-gray-600 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {teacher.name_ne}
          </p>
          <p className="text-blue-600 font-medium mb-2">
            {teacher.position_en}
          </p>
          <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {teacher.position_ne}
          </p>
        </div>
        
        {/* Bio Preview */}
        {teacher.bio_en && (
          <p className="text-gray-700 text-sm mb-4 overflow-hidden" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical' 
          }}>
            {teacher.bio_en}
          </p>
        )}
        
        {/* Quick Info */}
        <div className="space-y-2 text-sm">
          {teacher.experience_years > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">{teacher.experience_years} years</span>
            </div>
          )}
          {teacher.specialization_en && (
            <div className="flex justify-between">
              <span className="text-gray-600">Specialization:</span>
              <span className="font-medium text-right">{teacher.specialization_en}</span>
            </div>
          )}
        </div>
        
        {/* Contact */}
        {(teacher.email || teacher.phone) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {teacher.email && (
              <p className="text-xs text-gray-500 mb-1">
                📧 {teacher.email}
              </p>
            )}
            {teacher.phone && (
              <p className="text-xs text-gray-500">
                📞 {teacher.phone}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function TeachersPage() {
  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error loading teachers:', error)
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Teachers</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Meet our dedicated faculty members who are committed to providing quality education 
          and nurturing the next generation of leaders.
        </p>
      </div>

      {teachers && teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            {error ? (
              <div className="text-red-600">
                <p className="font-semibold mb-2">Error Loading Teachers</p>
                <p className="text-sm">{error.message}</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p className="font-semibold mb-2">No Teachers Found</p>
                <p className="text-sm">Teacher profiles will appear here once they are added.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mt-12 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-medium">Teachers Data:</span>{' '}
          <span className={error ? 'text-red-600' : 'text-green-600'}>
            {error ? 'Error' : `${teachers?.length || 0} teachers loaded`}
          </span>
        </p>
      </div>
    </div>
  )
}
