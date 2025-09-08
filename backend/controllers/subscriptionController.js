const User = require('../models/User');
const { paystack, SUBSCRIPTION_PLANS, PAYSTACK_EVENTS } = require('../config/paystack');

// @desc    Get subscription plans
// @route   GET /api/subscription/plans
// @access  Public
exports.getSubscriptionPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans'
    });
  }
};

// @desc    Get user's current subscription
// @route   GET /api/subscription/current
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscription isPremium premiumFeatures');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('🔍 Current subscription for user:', user.email);
    console.log('🔍 Subscription data:', user.subscription);
    console.log('🔍 IsPremium:', user.isPremium);
    console.log('🔍 PremiumFeatures:', user.premiumFeatures);

    res.status(200).json({
      success: true,
      subscription: user.subscription,
      isPremium: user.isPremium,
      premiumFeatures: user.premiumFeatures,
      plan: SUBSCRIPTION_PLANS[user.subscription.plan]
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current subscription'
    });
  }
};

// @desc    Initialize subscription payment
// @route   POST /api/subscription/initialize
// @access  Private
exports.initializeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    console.log('🔍 Initialize subscription request:', { plan, userId });

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      console.log('❌ Invalid plan:', plan, 'Available plans:', Object.keys(SUBSCRIPTION_PLANS));
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    if (plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot initialize payment for free plan'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has an active premium subscription
    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'User already has an active premium subscription'
      });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan];
    const amount = planConfig.price; // Amount in kobo

    // Create Paystack customer if not exists
    let customerId = user.subscription.paystackCustomerId;
    if (!customerId) {
      console.log('🔍 Creating Paystack customer for:', user.email);
      const customer = await paystack.customer.create({
        email: user.email,
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ').slice(1).join(' ') || '',
        phone: user.phone
      });

      console.log('🔍 Paystack customer creation response:', customer);

      if (!customer.status) {
        console.log('❌ Failed to create Paystack customer:', customer);
        return res.status(400).json({
          success: false,
          message: 'Failed to create Paystack customer'
        });
      }

      customerId = customer.data.customer_code;
      
      // Update user with customer ID
      user.subscription.paystackCustomerId = customerId;
      await user.save();
    }

    // Initialize payment transaction with Paystack
    const transaction = await paystack.transaction.initialize({
      email: user.email,
      amount: amount,
      currency: 'NGN',
      reference: `sub_${Date.now()}_${userId}`,
      metadata: {
        plan: plan,
        userId: userId,
        customerId: customerId
      }
    });

    if (!transaction.status) {
      console.log('❌ Failed to initialize Paystack transaction:', transaction);
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }

    // Update user subscription details
    user.subscription.plan = plan;
    user.subscription.status = 'inactive'; // Will be activated after payment
    user.subscription.paystackCustomerId = customerId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      payment: {
        authorizationUrl: transaction.data.authorization_url,
        accessCode: transaction.data.access_code,
        reference: transaction.data.reference,
        customerCode: customerId,
        amount: amount,
        plan: planConfig
      }
    });
  } catch (error) {
    // console.error('Error initializing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing subscription'
    });
  }
};

// @desc    Verify subscription payment
// @route   POST /api/subscription/verify
// @access  Private
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const userId = req.user.id;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Verify payment with Paystack
    const verification = await paystack.transaction.verify(reference);

    if (!verification.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if payment was successful
    if (verification.data.status === 'success') {
      console.log('✅ Payment verification successful, updating user subscription...');
      
      // Update user subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + SUBSCRIPTION_PLANS.premium.duration);
      
      console.log('🔍 Setting end date to:', endDate);
      console.log('🔍 Premium duration:', SUBSCRIPTION_PLANS.premium.duration, 'days');

      user.subscription.plan = 'premium';
      user.subscription.status = 'active';
      user.subscription.startDate = new Date();
      user.subscription.endDate = endDate;
      user.subscription.autoRenew = true;
      user.isPremium = true;
      
      console.log('🔍 Updated subscription data:', user.subscription);
      
      // Add premium benefits
      user.premiumFeatures = {
        verifiedBadge: true,
        prioritySearch: true,
        advancedAnalytics: true,
        unlimitedBookings: true,
        premiumSupport: true,
        featuredListing: true
      };
      
      console.log('🔍 Saving user to database...');
      const savedUser = await user.save();
      console.log('✅ User saved successfully');

      console.log(`✅ Premium subscription activated for user: ${savedUser.email}`);
      console.log(`🔍 User isPremium status: ${savedUser.isPremium}`);
      console.log(`🔍 User premiumFeatures:`, savedUser.premiumFeatures);
      console.log(`🔍 User subscription endDate:`, savedUser.subscription.endDate);

      const responseData = {
        success: true,
        message: 'Premium subscription activated successfully! You now have access to all premium features.',
        subscription: savedUser.subscription,
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          isPremium: savedUser.isPremium,
          premiumFeatures: savedUser.premiumFeatures
        }
      };

      console.log(`🔍 Sending response:`, responseData);

      res.status(200).json(responseData);
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment was not successful'
      });
    }
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying subscription payment'
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel free subscription'
      });
    }

    // Disable subscription on Paystack
    if (user.subscription.paystackSubscriptionId) {
      try {
        await paystack.subscription.disable(user.subscription.paystackSubscriptionId);
      } catch (error) {
        // console.error('Error disabling Paystack subscription:', error);
      }
    }

    // Update user subscription
    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;
    user.isPremium = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    // console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// @desc    Handle Paystack webhooks
// @route   POST /api/subscription/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    const body = req.body;

    // Verify webhook signature
    const crypto = require('crypto');
    const hash2 = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== hash2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = body.event;
    const data = body.data;

    switch (event) {
      case PAYSTACK_EVENTS.CHARGE_SUCCESS:
        await handleChargeSuccess(data);
        break;
      case PAYSTACK_EVENTS.SUBSCRIPTION_DISABLE:
        await handleSubscriptionDisable(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    // console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling webhook'
    });
  }
};

// Helper function to handle successful charge
async function handleChargeSuccess(data) {
  try {
    const { customer, subscription } = data;
    
    if (subscription) {
      const user = await User.findOne({ 
        'subscription.paystackSubscriptionId': subscription.subscription_code 
      });
      
      if (user) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + SUBSCRIPTION_PLANS.premium.duration);
        
        user.subscription.status = 'active';
        user.subscription.startDate = new Date();
        user.subscription.endDate = endDate;
        user.isPremium = true;
        
        await user.save();
        console.log(`Subscription activated for user: ${user.email}`);
      }
    }
  } catch (error) {
    // console.error('Error handling charge success:', error);
  }
}

// Helper function to handle subscription disable
async function handleSubscriptionDisable(data) {
  try {
    const { subscription_code } = data;
    
    const user = await User.findOne({ 
      'subscription.paystackSubscriptionId': subscription_code 
    });
    
    if (user) {
      user.subscription.status = 'cancelled';
      user.isPremium = false;
      
      await user.save();
      console.log(`Subscription cancelled for user: ${user.email}`);
    }
  } catch (error) {
    // console.error('Error handling subscription disable:', error);
  }
}
