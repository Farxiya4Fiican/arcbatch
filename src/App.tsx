import ConnectWallet from './components/ConnectWallet'
import UsdcBalance from './components/UsdcBalance'
import BatchPaymentForm from './components/BatchPaymentForm'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <span>ArcBatch</span>
        </div>

        <nav className="nav-links">
          <button className="nav-item active">Home</button>
          <button className="nav-item">Batches</button>
          <button className="nav-item">Recipients</button>
          <button className="nav-item">Settings</button>
        </nav>

        <div className="topbar-actions">
          <div className="network-pill">
            <span className="network-dot" />
            Arc Testnet
          </div>

          <ConnectWallet />
        </div>
      </header>

      <main className="dashboard">
        <section className="main-column">
          <div className="intro">
            <h1>
              Batch payments, <span>simplified.</span>
            </h1>

            <p>
              Send USDC to multiple recipients on Arc in one
              streamlined transaction.
            </p>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">⚡</div>
                <div>
                  <strong>One transaction</strong>
                  <span>Multiple recipients</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">◈</div>
                <div>
                  <strong>Lower costs</strong>
                  <span>Save on fees</span>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">👥</div>
                <div>
                  <strong>Built for everyone</strong>
                  <span>Teams, communities, creators</span>
                </div>
              </div>
            </div>
          </div>

        <BatchPaymentForm />

          <section className="card recent-card">
            <div className="card-header">
              <div>
                <span className="section-icon">↻</span>
                <h2>Recent batches</h2>
              </div>
            </div>

            <div className="recent-head">
              <span>Date</span>
              <span>Recipients</span>
              <span>Total (USDC)</span>
              <span>Status</span>
              <span>Transaction</span>
            </div>

            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <strong>No batches yet</strong>
              <span>Create your first batch payment to get started.</span>
            </div>
          </section>
        </section>

        <aside className="sidebar">
          <section className="card wallet-card">
            <div className="sidebar-title">
              <div>
                <span className="section-icon">▣</span>
                <h3>Wallet & Balance</h3>
              </div>

              <span className="status-badge">Connected</span>
            </div>

            <UsdcBalance />

            <div className="sidebar-buttons">
              <button className="outline-button">
                View on Explorer
              </button>

              <button className="outline-button">
                Copy Address
              </button>
            </div>
          </section>

          <section className="card network-card">
            <div className="sidebar-title">
              <div>
                <span className="section-icon">⌁</span>
                <h3>Network</h3>
              </div>

              <span className="testnet-badge">Testnet</span>
            </div>

            <div className="network-row">
              <span>Network</span>
              <strong>Arc Testnet</strong>
            </div>

            <div className="network-row">
              <span>USDC Address</span>
              <code>0x3600...0000</code>
            </div>

            <div className="network-row">
              <span>RPC URL</span>
              <code>Arc Testnet RPC</code>
            </div>
          </section>

          <section className="card faucet-card">
            <div className="faucet-content">
              <div className="benefit-icon">💡</div>

              <div>
                <h3>Need test USDC?</h3>
                <p>
                  Get test USDC from the Circle Faucet for
                  development.
                </p>
              </div>
            </div>

            <a
              className="outline-button faucet-link"
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noreferrer"
            >
              Open Circle Faucet
            </a>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App