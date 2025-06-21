import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function FunFacts({ onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </Button>
        <h1 className="text-2xl font-bold">Fun Facts</h1>
      </div>
      <p className="text-lg text-slate-700">This section will contain interesting facts to explore. Stay tuned!</p>
    </div>
  );
}
