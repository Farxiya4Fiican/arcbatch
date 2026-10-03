import {
  useState,
} from 'react'

import {
  useAccount,
} from 'wagmi'

import './App.css'

import BatchPaymentForm from './components/BatchPaymentForm'
import ConnectWallet from './components/ConnectWallet'
import RecentBatches from './components/RecentBatches'
import Recipients from './components/Recipients'
import UsdcBalance from './components/UsdcBalance'
import Settings from './components/Settings'

import {
  USDC_ADDRESS,
} from './config/tokens'

type Page =
  | 'home'
  | 'batches'
  | 'recipients'
  | 'settings'

const ARC_EXPLORER_URL =
  'https://explorer.arc.io'

export default function App() {
  const [
    activePage,
    setActivePage,
  ] = useState<Page>('home')

  const {
    address,
    isConnected,
  } = useAccount()

  const shortenAddress = (
    value?: string,
  ) => {
    if (!value) {
      return ''
    }

    return `${value.slice(
      0,
      6,
    )}...${value.slice(-4)}`
  }

  const copyAddress = async () => {
    if (!address) {
      return
    }

    await navigator.clipboard.writeText(
      address,
    )
  }

  const renderNavButton = (
    page: Page,
    label: string,
  ) => {
    return (
      <button
        type="button"
        className={
          activePage === page
            ? 'nav-item active'
            : 'nav-item'
        }
        onClick={() =>
          setActivePage(page)
        }
      >
        {label}
      </button>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="brand"
          onClick={() =>
            setActivePage('home')
          }
          style={{
            border: 0,
            background: 'transparent',
            padding: 0,
          }}
        >
          <span className="brand-mark">
            A
          </span>

          <span>
            ArcBatch
          </span>
        </button>

        <nav className="nav-links">
          {renderNavButton(
            'home',
            'Home',
          )}

          {renderNavButton(
            'batches',
            'Batches',
          )}

          {renderNavButton(
            'recipients',
            'Recipients',
          )}

          {renderNavButton(
            'settings',
            'Settings',
          )}
        </nav>

        <div className="topbar-actions">
          <div className="network-pill">
            <span className="network-dot" />

            Arc Mainnet
          </div>

          <ConnectWallet />
        </div>
      </header>

      {activePage === 'home' && (
        <div className="dashboard">
          <main className="main-column">
            <section className="intro">
              <h1>
                Batch payments,{' '}
                <span>
                  simplified.
                </span>
              </h1>

              <p>
                Send USDC to multiple
                recipients on Arc Mainnet
                in one streamlined
                transaction.
              </p>

              <div className="benefits">
                <div className="benefit">
                  <div className="benefit-icon">
                    ⚡
                  </div>

                  <div>
                    <strong>
                      One transaction
                    </strong>

                    <span>
                      Multiple recipients
                    </span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon">
                    ◇
                  </div>

                  <div>
                    <strong>
                      Lower costs
                    </strong>

                    <span>
                      Save on fees
                    </span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon">
                    👥
                  </div>

                  <div>
                    <strong>
                      Built for everyone
                    </strong>

                    <span>
                      Teams, communities,
                      creators
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <BatchPaymentForm />

            <RecentBatches />
          </main>

          <aside className="sidebar">
            <section className="card wallet-card">
              <div className="sidebar-title">
                <div>
                  <span className="section-icon">
                    ▣
                  </span>

                  <h3>
                    Wallet & Balance
                  </h3>
                </div>

                {isConnected && (
                  <span className="status-badge">
                    Connected
                  </span>
                )}
              </div>

              <UsdcBalance />

              {isConnected &&
                address && (
                  <div className="sidebar-buttons">
                    <a
                      className="outline-button"
                      href={`${ARC_EXPLORER_URL}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer
                    </a>

                    <button
                      type="button"
                      className="outline-button"
                      onClick={
                        copyAddress
                      }
                    >
                      Copy Address
                    </button>
                  </div>
                )}
            </section>

            <section className="card network-card">
              <div className="sidebar-title">
                <div>
                  <span className="section-icon">
                    ⌁
                  </span>

                  <h3>
                    Network
                  </h3>
                </div>

                <span className="testnet-badge">
                  Mainnet
                </span>
              </div>

              <div className="network-row">
                <span>
                  Network
                </span>

                <strong>
                  Arc Mainnet
                </strong>
              </div>

              <div className="network-row">
                <span>
                  USDC Address
                </span>

                <code>
                  {shortenAddress(
                    USDC_ADDRESS,
                  )}
                </code>
              </div>

              <div className="network-row">
                <span>
                  RPC
                </span>

                <strong>
                  Alchemy
                </strong>
              </div>
            </section>
          </aside>
        </div>
      )}

      {activePage ===
        'batches' && (
          <div className="page-content">
            <RecentBatches />
          </div>
        )}

      {activePage ===
        'recipients' && (
          <div className="page-content">
            <Recipients />
          </div>
        )}

      {activePage ===
        'settings' && (
          <div className="page-content">
            <Settings />
          </div>
        )}
    </div>
  )
}