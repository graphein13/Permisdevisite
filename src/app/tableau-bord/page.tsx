import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TableauBordComponent from '@/components/TableauBordComponent';

export default function TableauBordPage() {
  return (
    <div className="permis-visite-app">
      <Header />
      <main className="permis-visite-content">
        <TableauBordComponent />
      </main>
      <Footer />
    </div>
  );
}
