import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FormulaireDemandeComponent from '@/components/FormulaireDemandeComponent';

export default function FormulairePage() {
  return (
    <div className="permis-visite-app">
      <Header />
      <main className="permis-visite-content">
        <FormulaireDemandeComponent />
      </main>
      <Footer />
    </div>
  );
}
