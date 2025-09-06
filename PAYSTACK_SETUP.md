# Paystack Subscription System Setup

## Backend Environment Variables

Add these variables to your `backend/.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

## Frontend Environment Variables

Add these variables to your `frontend/.env` file:

```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

## Paystack Setup Steps

1. **Create Paystack Account**: Go to [paystack.com](https://paystack.com) and create an account
2. **Get API Keys**: 
   - Go to Settings > API Keys & Webhooks
   - Copy your Test Secret Key and Test Public Key
   - Add them to your environment variables
3. **Set up Webhook**: 
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/subscription/webhook`
   - Select events: `subscription.create`, `subscription.enable`, `subscription.disable`, `charge.success`

## Features Implemented

### Backend
- ✅ User model updated with subscription fields
- ✅ Subscription plans configuration
- ✅ Paystack integration for payments
- ✅ Webhook handling for subscription events
- ✅ API routes for subscription management
- ✅ Premium artisans prioritized in search results

### Frontend
- ✅ Subscription management page
- ✅ Paystack payment integration
- ✅ Premium badges on artisan cards
- ✅ Subscription status indicators
- ✅ Payment verification and success handling

## API Endpoints

### Public Routes
- `GET /api/subscription/plans` - Get available subscription plans
- `POST /api/subscription/webhook` - Paystack webhook handler

### Protected Routes (Require Authentication)
- `GET /api/subscription/current` - Get user's current subscription
- `POST /api/subscription/initialize` - Initialize subscription payment
- `POST /api/subscription/verify` - Verify payment after successful transaction
- `POST /api/subscription/cancel` - Cancel active subscription

## Subscription Plans

### Free Plan
- Price: ₦0
- Duration: Unlimited
- Features:
  - Basic profile listing
  - Standard search visibility
  - Basic customer support

### Premium Plan
- Price: ₦50.00/month
- Duration: 30 days
- Features:
  - Verified badge on profile
  - Priority in search results
  - Advanced analytics
  - Premium customer support
  - Unlimited bookings

## Database Schema Updates

The User model now includes:

```javascript
subscription: {
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  paystackSubscriptionId: { type: String, default: null },
  paystackCustomerId: { type: String, default: null },
  autoRenew: { type: Boolean, default: true }
},
isPremium: { 
  type: Boolean, 
  default: function() {
    return this.subscription?.plan === 'premium' && 
           this.subscription?.status === 'active' && 
           (!this.subscription?.endDate || this.subscription?.endDate > new Date());
  }
}
```

## Search Results Priority

Premium artisans are automatically prioritized in search results with the following order:
1. Premium status (premium artisans first)
2. Rating (higher rating first)
3. Review count (more reviews first)

## Testing

1. Start your backend server: `cd backend && npm start`
2. Start your frontend server: `cd frontend && npm start`
3. Navigate to `/artisan-subscription` as an artisan
4. Test the subscription flow with Paystack test cards

## Test Cards (Paystack)

Use these test card numbers for testing:
- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 4084084084084085
- **Invalid Card**: 4084084084084086

Expiry: Any future date
CVV: Any 3 digits
