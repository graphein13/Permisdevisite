import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DetailDemandeComponent from '@/components/DetailDemandeComponent';

interface DetailDemandePageProps {
  params: {
    id: string;
  };
}

export default function DetailDemandePage({ params }: DetailDemandePageProps) {
  return (
    <div className="permis-visite-app">
      <Header />
      <main className="permis-visite-content">
        <DetailDemandeComponent id={params.id} />
      </main>
      <Footer />
    </div>
  );
}
