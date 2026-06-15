import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Dashboard.module.css';

// Mock listings for demo
const MOCK_LISTINGS = [
  {
    id: 'lst_001',
    seller: 'Sarah Chen',
    sellerId: 'usr_seller_001',
    title: 'Enterprise SaaS API Integration',
    description: 'Custom REST API implementation for enterprise clients',
    price: 5000,
    category: 'Services',
    rating: 4.9,
    reviews: 127,
    verified: true,
  },
  {
    id: 'lst_002',
    seller: 'Tech Consulting Co.',
    sellerId: 'usr_seller_002',
    title: 'Cloud Architecture Audit',
    description: 'Full audit of your cloud infrastructure with recommendations',
    price: 8500,
    category: 'Services',
    rating: 4.95,
    reviews: 89,
    verified: true,
  },
  {
    id: 'lst_003',
    seller: 'Dev Studio Pro',
    sellerId: 'usr_seller_003',
    title: 'React Component Library Build',
    description: 'Custom component library development with Storybook',
    price: 12000,
    category: 'Development',
    rating: 4.8,
    reviews: 156,
    verified: true,
  },
];

const KYC_TIERS = {
  INDIVIDUAL: { name: 'Individual', limit: 10000, color: '#E6F1FB' },
  BUSINESS: { name: 'Business', limit: 100000, color: '#EAF3DE' },
  ENTERPRISE: { name: 'Enterprise', limit: 1000000, color: '#EEEDFE' },
};

export default function Dashboard() {
  const [step, setStep] = useState('welcome'); // welcome, kyc, marketplace, transaction
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('individual');
  const [companyName, setCompanyName] = useState('');
  
  const [verified, setVerified] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    if (!userEmail || !userName) {
      setError('Email and name required');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/kyc/verify', {
        userEmail,
        userName,
        userType,
        companyName: userType !== 'individual' ? companyName : undefined,
      });

      setKycData(res.data);
      setVerified(true);
      setStep('marketplace');
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedListing) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/settlement/marketplace', {
        buyerId: kycData.user_id,
        sellerId: selectedListing.sellerId,
        amount: selectedListing.price,
        listingId: selectedListing.id,
        description: selectedListing.title,
        buyerKycLevel: kycData.kyc_level,
        sellerKycLevel: 3, // Mock: sellers are verified
      });

      setTransactionStatus(res.data);
      setStep('transaction');
    } catch (err) {
      setError('Purchase failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>✓</div>
          <div>
            <h1>VerifiedTrade</h1>
            <p>Trusted marketplace with instant compliant settlements</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.alert}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step 1: KYC Welcome */}
        {step === 'welcome' && !verified && (
          <div className={styles.centerCard}>
            <h2>Welcome to VerifiedTrade</h2>
            <p>Connect with verified sellers. Get instant compliant settlements.</p>
            
            <div className={styles.grid}>
              {Object.entries(KYC_TIERS).map(([key, tier]) => (
                <div key={key} className={styles.tierCard} style={{ backgroundColor: tier.color }}>
                  <h3>{tier.name}</h3>
                  <p className={styles.limit}>Up to ${tier.limit.toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      setUserType(key.toLowerCase());
                      setStep('kyc');
                    }}
                    className={styles.button}
                  >
                    Verify as {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: KYC Form */}
        {step === 'kyc' && !verified && (
          <div className={styles.centerCard}>
            <h2>Identity Verification (A-Pass)</h2>
            <p>Quick verification to unlock instant compliant trading</p>

            <div className={styles.formGroup}>
              <label>Full name *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email address *</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            {userType !== 'individual' && (
              <div className={styles.formGroup}>
                <label>Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
            )}

            <button 
              onClick={handleVerify} 
              disabled={loading}
              className={styles.buttonPrimary}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button 
              onClick={() => setStep('welcome')}
              className={styles.buttonSecondary}
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Marketplace */}
        {step === 'marketplace' && verified && (
          <>
            <div className={styles.statusBar}>
              <div className={styles.statusItem}>
                <span className={styles.label}>Status</span>
                <span className={styles.value} style={{ color: '#3B6D11' }}>✓ Verified</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>KYC Tier</span>
                <span className={styles.value}>{kycData.kyc_tier}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Trade Limit</span>
                <span className={styles.value}>${kycData.max_trade_limit.toLocaleString()}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Trust Score</span>
                <span className={styles.value}>{(kycData.trust_score * 100).toFixed(0)}%</span>
              </div>
            </div>

            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Verified Sellers</h2>
            <div className={styles.listingsGrid}>
              {MOCK_LISTINGS.map((listing) => (
                <div 
                  key={listing.id} 
                  className={styles.listingCard}
                  onClick={() => setSelectedListing(listing)}
                  style={{
                    border: selectedListing?.id === listing.id ? '2px solid #185FA5' : '1px solid #D3D1C7',
                    cursor: 'pointer',
                  }}
                >
                  <div className={styles.listingHeader}>
                    <div>
                      <h3>{listing.title}</h3>
                      <p className={styles.seller}>
                        {listing.verified && '✓'} {listing.seller}
                      </p>
                    </div>
                    <div className={styles.price}>${listing.price.toLocaleString()}</div>
                  </div>
                  <p className={styles.description}>{listing.description}</p>
                  <div className={styles.listingFooter}>
                    <span className={styles.rating}>⭐ {listing.rating} ({listing.reviews} reviews)</span>
                    <span className={styles.category}>{listing.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedListing && (
              <div className={styles.card} style={{ marginTop: '2rem' }}>
                <h3>Confirm Purchase</h3>
                <table className={styles.summaryTable}>
                  <tbody>
                    <tr>
                      <td>Seller</td>
                      <td>{selectedListing.seller}</td>
                    </tr>
                    <tr>
                      <td>Service</td>
                      <td>{selectedListing.title}</td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>Amount</td>
                      <td style={{ color: '#185FA5' }}>${selectedListing.price.toLocaleString()} aUSDC</td>
                    </tr>
                    <tr>
                      <td>Settlement</td>
                      <td style={{ color: '#3B6D11' }}>Instant (5 seconds)</td>
                    </tr>
                  </tbody>
                </table>
                
                <button 
                  onClick={handlePurchase}
                  disabled={loading}
                  className={styles.buttonPrimary}
                  style={{ marginTop: '1rem' }}
                >
                  {loading ? 'Processing...' : 'Buy Now (A-Token Settlement)'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 4: Transaction Confirmation */}
        {step === 'transaction' && transactionStatus && (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2>Purchase Confirmed!</h2>
            
            <div className={styles.transactionDetails}>
              <div className={styles.detailRow}>
                <span>Transaction ID</span>
                <code>{transactionStatus.transaction_id}</code>
              </div>
              <div className={styles.detailRow}>
                <span>Amount</span>
                <strong>${transactionStatus.amount.toLocaleString()} aUSDC</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Status</span>
                <span style={{ color: '#3B6D11', fontWeight: 'bold' }}>✓ Settled</span>
              </div>
              <div className={styles.detailRow}>
                <span>Settlement Time</span>
                <span>~5 seconds from now</span>
              </div>
              <div className={styles.detailRow}>
                <span>Transparency Score</span>
                <span>{(transactionStatus.ccp_transparency_score * 100).toFixed(0)}% (CCP Protocol)</span>
              </div>
            </div>

            <p className={styles.successMessage}>
              The seller will receive payment instantly through the Cleanverse A-Token protocol.
              All transactions are verified and transparent via the CCP Protocol.
            </p>

            <button 
              onClick={() => {
                setStep('marketplace');
                setSelectedListing(null);
                setTransactionStatus(null);
              }}
              className={styles.buttonPrimary}
            >
              Browse More Listings
            </button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>VerifiedTrade | Powered by Cleanverse (A-Pass + A-Token + CCP Protocol)</p>
      </footer>
    </div>
  );
}
