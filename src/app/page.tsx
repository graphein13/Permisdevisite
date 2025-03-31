import { redirect } from 'next/navigation';

export default function Home() {
  // Rediriger vers le tableau de bord
  redirect('/tableau-bord');
}
