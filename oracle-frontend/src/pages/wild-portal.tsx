import WildPortalPage from '../components/WildPortal/WildPortalPage';

export default function WildPortal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-200 via-pink-200 to-yellow-100 p-8">
      <div className="max-w-4xl w-full bg-white bg-opacity-70 rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-fade-in">
        <WildPortalPage />
      </div>
    </div>
  );
}
