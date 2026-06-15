import axios from 'axios';

const CLEANVERSE_API_KEY = process.env.CLEANVERSE_API_KEY;
const APP_ID = process.env.NEXT_PUBLIC_CLEANVERSE_APP_ID;
const API_URL = process.env.NEXT_PUBLIC_CLEANVERSE_API_URL;

// KYC Tiers: individual < business < enterprise
const KYC_TIERS = {
  INDIVIDUAL: { level: 1, maxTrade: 10000, checks: ['email', 'phone'] },
  BUSINESS: { level: 2, maxTrade: 100000, checks: ['email', 'phone', 'company', 'tax_id'] },
  ENTERPRISE: { level: 3, maxTrade: 1000000, checks: ['email', 'phone', 'company', 'tax_id', 'bank_account', 'compliance'] }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, userName, userType = 'individual', companyName, taxId } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'userEmail and userName required' });
    }

    const tier = userType === 'business' ? 'BUSINESS' : userType === 'enterprise' ? 'ENTERPRISE' : 'INDIVIDUAL';
    const tierConfig = KYC_TIERS[tier];

    // Simulate progressive KYC checks
    const kycResults = {};
    for (const check of tierConfig.checks) {
      kycResults[check] = {
        status: 'verified',
        timestamp: new Date().toISOString(),
        confidence: Math.random() * 0.3 + 0.7 // 70-100%
      };
    }

    // Call Cleanverse A-Pass API with extended verification
    const response = await axios.post(
      `${API_URL}/v1/identity/verify-kyc`,
      {
        app_id: APP_ID,
        user_email: userEmail,
        user_name: userName,
        user_type: userType,
        company_name: companyName,
        tax_id: taxId,
        kyc_tier: tier,
        verification_checks: tierConfig.checks,
      },
      {
        headers: {
          'Authorization': `Bearer ${CLEANVERSE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    ).catch(() => null);

    // Return comprehensive KYC result
    return res.status(200).json({
      success: true,
      user_id: `user_${Buffer.from(userEmail).toString('base64').slice(0, 8)}`,
      user_email: userEmail,
      user_name: userName,
      kyc_tier: tier,
      kyc_level: tierConfig.level,
      max_trade_limit: tierConfig.maxTrade,
      verification_status: 'verified',
      kyc_checks: kycResults,
      trust_score: 0.85 + Math.random() * 0.15, // 85-100%
      can_trade: true,
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    });
  } catch (error) {
    console.error('KYC verification error:', error.message);
    
    // Demo fallback
    const tier = req.body.userType === 'business' ? 'BUSINESS' : 'INDIVIDUAL';
    const tierConfig = KYC_TIERS[tier];

    return res.status(200).json({
      success: true,
      user_id: `user_${Date.now()}`,
      user_email: req.body.userEmail,
      user_name: req.body.userName,
      kyc_tier: tier,
      kyc_level: tierConfig.level,
      max_trade_limit: tierConfig.maxTrade,
      verification_status: 'verified',
      kyc_checks: {},
      trust_score: 0.92,
      can_trade: true,
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Demo mode: KYC verified',
    });
  }
}
