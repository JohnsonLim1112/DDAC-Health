export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to HLife</h1>
        <p className="text-gray-600 mb-8">Your Health Simplified & Smart</p>
        <div className="space-x-4">
          <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Login
          </a>
          <a href="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}