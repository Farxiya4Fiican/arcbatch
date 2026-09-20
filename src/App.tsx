import ConnectWallet from './components/ConnectWallet'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <span>ArcBatch</span>
        </div>

        <ConnectWallet />
      </header>

      <main className="hero">
        <div className="badge">
          Built on Arc
        </div>

        <h1>
          Send USDC to everyone.
          <span> In one batch.</span>
        </h1>

        <p className="hero-description">
          ArcBatch makes it simple to distribute USDC to teams,
          communities, hackathon winners, contributors, and
          organizations in one streamlined transaction.
        </p>

        <div className="features">
          <div className="feature">
            <strong>One batch</strong>
            <span>Multiple recipients</span>
          </div>

          <div className="feature">
            <strong>USDC</strong>
            <span>Stablecoin payments</span>
          </div>

          <div className="feature">
            <strong>Arc</strong>
            <span>Fast onchain settlement</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App