export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Campus Connect — Connecting students together
      </div>
    </footer>
  );
}
