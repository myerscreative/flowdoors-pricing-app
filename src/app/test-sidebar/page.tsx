import Sidebar from '@/components/admin/Sidebar'

export default function TestSidebarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FlowDoors Admin Panel</h1>
            <p className="text-gray-600">Updated sidebar with FlowDoors branding and colors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-flowdoors-blue-100 to-flowdoors-green-100 rounded-lg mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-2">Feature {i}</h3>
                <p className="text-sm text-gray-600">Sample content showcasing the new sidebar design</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
