// Content script to capture agar.io server information
(function() {
  'use strict';
  
  let serverInfo = {
    fullUrl: null,
    domain: null,
    region: null,
    wsUrl: null,
    captured: false
  };
  
  // Method 1: Intercept WebSocket connections (most reliable)
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const ws = new originalWebSocket(url, protocols);
    
    // Capture real agar.io server URLs like: wss://web-arenas-live-v25-0.agario.miniclippt.com/eu-west-2/3-9-190-4
    if (url.includes('agario.miniclippt.com') || url.includes('agar.io')) {
      console.log('Agar.io WebSocket detected:', url);
      
      // Extract full server URL
      serverInfo.fullUrl = url;
      
      // Extract domain and region
      const match = url.match(/wss?:\/\/([a-zA-Z0-9.-]+\.agario\.miniclippt\.com)\/([a-zA-Z0-9-\/]+)/);
      if (match) {
        serverInfo.domain = match[1];
        serverInfo.region = match[2];
        serverInfo.wsUrl = url;
        serverInfo.captured = true;
        
        // Store for popup
        chrome.storage.local.set({ 
          serverInfo: serverInfo,
          timestamp: Date.now()
        });
        
        console.log('Server info captured:', serverInfo);
      }
    }
    
    return ws;
  };
  
  // Method 2: Monitor game variables for server info
  setTimeout(() => {
    if (!serverInfo.captured) {
      try {
        // Check for game objects that might contain server info
        if (window.connect && window.connect.ws) {
          serverInfo.wsUrl = window.connect.ws;
          serverInfo.captured = true;
          
          chrome.storage.local.set({ 
            serverInfo: serverInfo,
            timestamp: Date.now()
          });
        }
        
        // Try to extract from other game variables
        if (window.mc && window.mc.url) {
          const urlMatch = window.mc.url.match(/([a-zA-Z0-9.-]+\.agario\.miniclippt\.com)/);
          if (urlMatch) {
            serverInfo.domain = urlMatch[1];
            serverInfo.captured = true;
          }
        }
      } catch (e) {
        console.log('Could not extract server info from game variables');
      }
    }
  }, 3000);
  
  // Method 3: Monitor fetch requests for server discovery
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (url && (url.includes('find-server') || url.includes('agario.miniclippt.com'))) {
      console.log('Agar.io server request detected:', url);
      
      // Try to extract server info from the request
      if (url.includes('find-server')) {
        // This is the server discovery request
        const urlObj = new URL(url);
        const region = urlObj.searchParams.get('region') || 'unknown';
        
        if (!serverInfo.captured) {
          serverInfo.region = region;
          chrome.storage.local.set({ 
            serverInfo: serverInfo,
            timestamp: Date.now()
          });
        }
      }
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Method 4: Monitor XMLHttpRequest for additional server info
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url) {
      if (url && url.includes('agario.miniclippt.com')) {
        console.log('Agar.io XHR detected:', url);
        
        // Extract server info from XHR URL
        const match = url.match(/([a-zA-Z0-9.-]+\.agario\.miniclippt\.com)/);
        if (match && !serverInfo.captured) {
          serverInfo.domain = match[1];
          serverInfo.captured = true;
          
          chrome.storage.local.set({ 
            serverInfo: serverInfo,
            timestamp: Date.now()
          });
        }
      }
      return originalOpen.apply(this, arguments);
    };
    
    xhr.send = function(data) {
      return originalSend.apply(this, arguments);
    };
    
    return xhr;
  };
  
  // Notify when page is fully loaded
  window.addEventListener('load', function() {
    console.log('Agar.io page loaded, server detection active');
    
    // Final attempt to get server info
    setTimeout(() => {
      chrome.storage.local.get(['serverInfo'], function(result) {
        if (!result.serverInfo || !result.serverInfo.captured) {
          console.log('Server info not captured, trying fallback methods');
          
          // Try to get server info from the current URL or page content
          try {
            const currentUrl = window.location.href;
            if (currentUrl.includes('agar.io')) {
              // User is on agar.io, try to get server from page
              serverInfo.region = 'detected-from-page';
              serverInfo.captured = true;
              
              chrome.storage.local.set({ 
                serverInfo: serverInfo,
                timestamp: Date.now()
              });
            }
          } catch (e) {
            console.log('Fallback methods failed');
          }
        }
      });
    }, 5000);
  });
  
})();