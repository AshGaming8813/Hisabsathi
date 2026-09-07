package com.hisabsaathi.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_CODE = 101;

    private final BroadcastReceiver smsReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("HISAB_SAATHI_SMS_RECEIVED".equals(intent.getAction())) {
                String body = intent.getStringExtra("body");
                if (body != null && bridge != null) {
                    // Escape JS string
                    String escapedBody = body.replace("\\", "\\\\")
                            .replace("'", "\\'")
                            .replace("\n", "\\n")
                            .replace("\r", "");
                    
                    // Evaluate in WebView
                    bridge.getWebView().post(() -> {
                        bridge.getWebView().evaluateJavascript(
                            "window.onSmsReceived && window.onSmsReceived('" + escapedBody + "');",
                            null
                        );
                    });
                }
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Request SMS permissions dynamically at launch
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.RECEIVE_SMS,
                Manifest.permission.READ_SMS
            }, SMS_PERMISSION_CODE);
        }

        // Register internal receiver for SMS
        IntentFilter filter = new IntentFilter("HISAB_SAATHI_SMS_RECEIVED");
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(smsReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(smsReceiver, filter);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(smsReceiver);
        } catch (Exception e) {
            // Ignore if already unregistered
        }
    }
}
