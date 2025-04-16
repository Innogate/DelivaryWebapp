package com.disha.airways;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    private static final int REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Request permission only if necessary
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUEST_CODE);
        }

        // Register JS interface after bridge is ready
        this.bridge.getWebView().addJavascriptInterface(new Object() {

            @JavascriptInterface
            public void saveFile(String base64Data, String filename) {
                try {
                    // Remove prefix if it exists
                    if (base64Data.contains(",")) {
                        base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                    }

                    byte[] decoded = Base64.decode(base64Data.trim(), Base64.DEFAULT);
                    OutputStream fos;

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                        values.put(MediaStore.Downloads.MIME_TYPE, "application/octet-stream");
                        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                        Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                        if (uri != null) {
                            fos = getContentResolver().openOutputStream(uri);
                            if (fos != null) {
                                fos.write(decoded);
                                fos.close();
                                runOnUiThread(() -> Toast.makeText(getApplicationContext(), "File saved to Downloads", Toast.LENGTH_SHORT).show());
                                Log.d("FileSave", "Saved using MediaStore: " + uri.toString());
                            }
                        }
                    } else {
                        File path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        if (!path.exists()) path.mkdirs();
                        File file = new File(path, filename);
                        fos = new FileOutputStream(file);
                        fos.write(decoded);
                        fos.close();
                        Log.d("FileSave", "Saved to: " + file.getAbsolutePath());
                    }
                } catch (Exception e) {
                    Log.e("FileSave", "Error: " + e.getMessage(), e);
                }
            }


            @JavascriptInterface
            public void printBase64File(String base64Data, String filename) {
                try {
                    String html = new String(Base64.decode(base64Data, Base64.DEFAULT), "UTF-8");

                    runOnUiThread(() -> {
                        WebView printWebView = new WebView(MainActivity.this);
                        printWebView.getSettings().setJavaScriptEnabled(false);
                        printWebView.loadDataWithBaseURL(null, html, "text/HTML", "UTF-8", null);

                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public void onPageFinished(WebView view, String url) {
                                PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
                                PrintDocumentAdapter printAdapter = printWebView.createPrintDocumentAdapter(filename);
                                printManager.print(filename, printAdapter, new PrintAttributes.Builder().build());
                            }
                        });
                    });

                } catch (Exception e) {
                    Log.e("Print", "Error: " + e.getMessage(), e);
                }
            }
        }, "AndroidInterface");
    }
}
