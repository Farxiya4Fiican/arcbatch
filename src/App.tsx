import ConnectWallet from './components/ConnectWallet'
import UsdcBalance from './components/UsdcBalance'
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

          <section className="card payment-card">
            <div className="card-header">
              <div>
                <span className="section-icon">▣</span>
                <h2>New batch payment</h2>
              </div>
            </div>

            <div className="payment-table">
              <div className="payment-head">
                <span>#</span>
                <span>Recipient address</span>
                <span>Amount (USDC)</span>
                <span />
              </div>

              {[1, 2, 3].map((row) => (
                <div className="payment-row" key={row}>
                  <span>{row}</span>

                  <input
                    type="text"
                    placeholder="0x..."
                    aria-label={`Recipient ${row} address`}
                  />

                  <div className="amount-field">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      aria-label={`Recipient ${row} amount`}
                    />
                    <span>USDC</span>
                  </div>

                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Remove recipient ${row}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="payment-actions">
              <div className="secondary-actions">
                <button className="outline-button">
                  + Add recipient
                </button>

                <button className="outline-button">
                  Import CSV
                </button>
              </div>

              <div className="totals">
                <span>
                  Recipients: <strong>0</strong>
                </span>

                <span className="divider" />

                <span>
                  Total: <strong>0.00 USDC</strong>
                </span>
              </div>
            </div>

            <button className="primary-action">
              Review batch
              <span>→</span>
            </button>
          </section>

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