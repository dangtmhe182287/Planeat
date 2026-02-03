const axios = require('axios');
const mongoose = require('mongoose');
const Subscription = require('../models/subscription.model');
const {getPayPalToken} = require('../helpers/getPayPalToken');

const createSubscription = async (req, res) => {
  try {
    const { subscriptionID } = req.body;

    if (!subscriptionID) {
      return res.status(400).json({ message: 'Subscription ID is required' });
    }

    // Get subscription details from PayPal to check for trial
    const token = await getPayPalToken();
    const response = await axios.get(
      `${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const paypalSub = response.data;
    const updateData = {
      paypalSubscriptionId: subscriptionID,
      status: paypalSub.status.toLowerCase()
    };

    // Check if there's an active trial
    if (paypalSub.billing_info?.next_billing_time && paypalSub.billing_info?.cycle_executions?.[0]?.cycles_completed === 0) {
      updateData.trialStartDate = new Date(paypalSub.start_time);
      updateData.trialEndDate = new Date(paypalSub.billing_info.next_billing_time);
      updateData.status = 'trial';
    }

    // Save PayPal's subscriptionID to our DB and set status to active
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, upsert: true } // creates the doc if it doesn't exist yet
    );

    return res.status(201).json(subscription);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription || !subscription.paypalSubscriptionId) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Subscription is already cancelled' });
    }

    // 1. Get a fresh access token from PayPal
    const token = await getPayPalToken();

    // 2. Call PayPal's cancel endpoint — returns 204 if successful
    await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscription.paypalSubscriptionId}/cancel`,
      { reason: 'User requested cancellation' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3. Update our DB
    subscription.status = 'cancelled';
    await subscription.save();

    return res.status(200).json({ message: 'Subscription cancelled' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // If the user is on a trial and it's expired, update the status automatically
    if (subscription.status === 'trial' && subscription.trialEndDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
    }

    return res.status(200).json(subscription);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const webhook = async (req, res) => {
  try {
    const isValid = await verifyWebhookSignature(req);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    const { event_type, resource } = req.body;
    const paypalSubscriptionId = resource?.id;

    // Find the subscription in our DB using PayPal's subscription ID
    const subscription = await Subscription.findOne({ paypalSubscriptionId });

    if (!subscription) {
      // Could be an event for something we don't track — just return 200 so PayPal doesn't retry
      return res.status(200).json({ message: 'Subscription not found, ignoring' });
    }

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        subscription.status = 'active';
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        subscription.status = 'cancelled';
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        subscription.status = 'expired';
        break;

      case 'PAYMENT.SALE.COMPLETED':
        subscription.lastPaymentDate = new Date();
        // subscription stays active, just track payment
        break;

      default:
        return res.status(200).json({ message: 'Event not handled' });
    }

    await subscription.save();
    // Must return 200 — if we don't, PayPal will retry up to 25 times
    return res.status(200).json({ message: 'Webhook handled' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const verifyWebhookSignature = async (req) => {
  const token = await getPayPalToken();
  
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      transmission_id: req.headers['paypal-transmission-id'],
      transmission_time: req.headers['paypal-transmission-time'],
      cert_url: req.headers['paypal-cert-url'],
      auth_algo: req.headers['paypal-auth-algo'],
      transmission_sig: req.headers['paypal-transmission-sig'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: req.body
    },
    { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  
  return response.data.verification_status === 'SUCCESS';
};

module.exports = { getStatus, createSubscription, cancelSubscription, webhook };