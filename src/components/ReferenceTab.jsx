import { referenceRows, standardModels } from "../data/constants";
import SectionCard from "./SectionCard";

export default function ReferenceTab() {
  return (
    <div className="tab-panel">
      <SectionCard title="// Tabela de Hainsworth (1981)">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Grupo animal</th>
                <th>K</th>
                <th>Temp. corporal</th>
              </tr>
            </thead>
            <tbody>
              {referenceRows.map((row) => (
                <tr key={row.group}>
                  <td>{row.group}</td>
                  <td>
                    <span className="kv">{row.k}</span>
                  </td>
                  <td>{row.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tip">
          <strong>Dica de prova:</strong> identifique o grupo do silvestre e use o
          K correto. Crax fasciolata (mutum) e ave nao-passeriforme, entao K=78.
          Speothos venaticus (cachorro-vinagre) e mamifero placentado, entao
          K=70 e o modelo mais natural costuma ser o cao.
        </div>
      </SectionCard>

      <SectionCard title="// Modelos metabolicos padrao">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Animal</th>
                <th>Peso padrao</th>
                <th>K</th>
              </tr>
            </thead>
            <tbody>
              {standardModels.map((model) => (
                <tr key={model.animal}>
                  <td>{model.animal}</td>
                  <td>{model.weight}</td>
                  <td>
                    <span className="kv">{model.k}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="// Todas as formulas">
        <div className="method-mini">
          <span className="yn">TMB</span> = K x M
          <sup>0,75</sup> <span className="sep">← Kcal/24h</span>
          <br />
          <span className="yn">Dose_total_modelo</span> = dose (mg/kg) x
          peso_modelo
          <br />
          <span className="yn">Dose/Kcal</span> = Dose_total_modelo / TMB_modelo
          <br />
          <span className="gn">Dose_alvo (mg)</span> = Dose/Kcal x TMB_alvo
          <br />
          <span className="gn">Dose_alvo (mg/kg)</span> = Dose_alvo (mg) /
          peso_alvo
          <br />
          <br />
          <span className="yn">TME</span> = TMB / M
          <br />
          <span className="gn">Intervalo_alvo</span> = (TME_modelo x
          intervalo_modelo) / TME_alvo
        </div>
      </SectionCard>
    </div>
  );
}
