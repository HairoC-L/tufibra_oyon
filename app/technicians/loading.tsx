/*export default function Loading() {
  return null
}*/


// loading.js
import '../loading.css'

export default function Loading() {
  return (
    <div className="loader-container">
      <div className="bars-loader">
        <div></div><div></div><div></div><div></div><div></div>
      </div>
      <p>Cargando...</p>
    </div>
  );
}
