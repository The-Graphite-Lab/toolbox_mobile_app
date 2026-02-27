#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(AudioRecordingPlugin, "AudioRecording",
           CAP_PLUGIN_METHOD(start, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(pause, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(resume, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getStatus, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getLevels, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(startRideAlongSession, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(stopRideAlongSession, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getRideAlongSessionState, CAPPluginReturnPromise);
<<<<<<< Current (Your changes)
=======
           CAP_PLUGIN_METHOD(uploadRideAlongRecordingToUrl, CAPPluginReturnPromise);
>>>>>>> Incoming (Background Agent changes)
)

