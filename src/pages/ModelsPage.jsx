import ModelsTable from '../components/ModelsTable';
import './ModelsPage.css';

function ModelsPage() {
  return (
    <div className="models-page">
      <div className="container-wide">
        <ModelsTable />
      </div>
    </div>
  );
}

export default ModelsPage;
