package com.hisabsaathi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "HisabSaathiSMS";

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                try {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    if (pdus != null) {
                        StringBuilder fullBody = new StringBuilder();
                        String sender = "";

                        for (Object pdu : pdus) {
                            String format = bundle.getString("format");
                            SmsMessage message = SmsMessage.createFromPdu((byte[]) pdu, format);
                            sender = message.getDisplayOriginatingAddress();
                            fullBody.append(message.getMessageBody());
                        }

                        Log.d(TAG, "SMS Received from: " + sender + " Body: " + fullBody.toString());

                        // Dispatch intent broadcast to MainActivity
                        Intent smsIntent = new Intent("HISAB_SAATHI_SMS_RECEIVED");
                        smsIntent.putExtra("sender", sender);
                        smsIntent.putExtra("body", fullBody.toString());
                        context.sendBroadcast(smsIntent);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing incoming SMS", e);
                }
            }
        }
    }
}
