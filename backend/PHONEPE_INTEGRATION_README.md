# PhonePe v2 API Integration

This document describes the PhonePe payment gateway integration implemented in this project.

## Overview

The integration uses PhonePe's v2 API with OAuth 2.0 authentication instead of the older checksum-based approach.

## Configuration

### Environment Variables

The following environment variables are required in your `config.env` file:

```env
# PhonePe Production Configuration
PHONEPE_MERCHANT_ID=SU2508251500285640112856
PHONEPE_SALT_KEY=006c20b2-0a39-423a-9cd3-8e359879dd15
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg/checkout
PHONEPE_AUTH_TOKEN_URL=https://api.phonepe.com/apis/identity-manager/v1/oauth/token
PHONEPE_CALLBACK_URL=https://InternKatta.gradezy.in/api/payment/callback
PHONEPE_REDIRECT_URL=https://InternKatta.gradezy.in/payment/callback
```

### API Endpoints

- **Payment Initiation**: `POST /api/payment/course` or `POST /api/payment/internship`
- **Payment Callback**: `POST /api/payment/callback`
- **Payment Status**: `GET /api/payment/status/:transactionId`
- **Test Configuration**: `GET /api/payment/test-config`
- **PhonePe Status**: `GET /api/payment/phonepe-status/:transactionId`

## Payment Flow

### 1. Payment Initiation

1. User selects a course/internship
2. Frontend calls payment initiation API
3. Backend generates unique transaction ID
4. Backend gets PhonePe authorization token
5. Backend calls PhonePe v2 API with payment payload
6. PhonePe returns redirect URL
7. Frontend redirects user to PhonePe payment page

### 2. Payment Processing

1. User completes payment on PhonePe
2. PhonePe redirects to callback URL
3. Backend processes payment status
4. User enrollment is updated based on payment status

### 3. Payment Status Checking

1. Frontend can check payment status using transaction ID
2. Backend queries PhonePe API for latest status
3. Payment record is updated accordingly

## API Response Format

### Payment Initiation Response

```json
{
  "success": true,
  "paymentUrl": "https://phonepe.com/pay/...",
  "transactionId": "TXN_1234567890_ABC123",
  "phonepeTransactionId": "PHONEPE_ORDER_ID"
}
```

### Payment Callback Data

```json
{
  "merchantOrderId": "TXN_1234567890_ABC123",
  "orderId": "PHONEPE_ORDER_ID",
  "amount": 10000,
  "status": "PAYMENT_SUCCESS",
  "paymentInstrument": {...}
}
```

## Testing

### Test Configuration

Run the test script to verify PhonePe integration:

```bash
cd backend
node test_phonepe_integration.js
```

### Test Endpoints

- `GET /api/payment/test-config` - Test PhonePe configuration
- `GET /api/payment/phonepe-status/:transactionId` - Check PhonePe payment status

## Error Handling

The integration includes comprehensive error handling for:

- Configuration validation
- Authorization token generation
- API request failures
- Payment status verification
- Callback processing

## Security Features

- OAuth 2.0 authentication with PhonePe
- Environment variable configuration
- Request validation
- Amount verification
- Transaction ID validation

## Troubleshooting

### Common Issues

1. **Authorization Token Failed**: Check PhonePe credentials and network connectivity
2. **Payment Initiation Failed**: Verify payload format and required fields
3. **Callback Not Received**: Check callback URL configuration
4. **Status Check Failed**: Verify transaction ID and PhonePe API access

### Debug Logging

Enable debug logging by checking console output for:
- 🔐 Authorization token generation
- 📤 API request details
- 📡 PhonePe API responses
- ✅ Success confirmations
- ❌ Error details

## Support

For PhonePe integration issues, check:
1. PhonePe API documentation
2. Network connectivity
3. Credential validity
4. API endpoint accessibility
5. Callback URL accessibility
