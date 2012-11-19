/**
 * Moodle mobile file system lib
 *
 * @package core
 * @copyright Juan Leyva <juanleyvadelgado@gmail.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


MM.fs = {

	init: function(callBack) {
		MM.log("FS: Loading File System");
		MM.fs.loadFS(callBack);
	},
   
    getRoot: function(){
        return MM.fs.fileSystemRoot.fullPath;
    },
    
    loadFS: function(callBack) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function(fileSystem) {
               MM.fs.fileSystemRoot = fileSystem.root;
               if (MM.deviceOS == "android") {
                MM.fs.fileSystemRoot.getDirectory("Android/data/" + MM.config.app_id, {create: true, exclusive: false},
                    function (entry) {
                        MM.fs.fileSystemRoot = entry;
                        callBack();
                    },
                    function() {
                        MM.popErrorMessage("Critial error accessing file system, Android/data/app_id does not exists or can be created") ;
                    }
                );
               } else {
                callBack();
               }
           }, function() {
              MM.popErrorMessage("Critial error accessing file system") 
           });                    
    },
    
    fileExists: function(path, successCallback, errorCallback) {

        MM.fs.fileSystemRoot.getFile(path, { create: false }, successCallback, errorCallback);
    },

    createDir: function(path, successCallback, dirEntry) {
        
        path = path.replace("file:///", "");
        MM.log("FS: Creating full directory " + path);
        
        var paths = path.split("/");
        
        var baseRoot = MM.fs.fileSystemRoot;
        if (dirEntry) {
            baseRoot = dirEntry;   
        }
        
        MM.log("FS: Creating directory " + paths[0]);
        baseRoot.getDirectory(paths[0], {create: true, exclusive: false},
            function(newDirEntry) {
                if (paths.length == 1) {
                    successCallback(newDirEntry);
                    return;
                }
                // Recursively, create next directories
                paths.shift();
                MM.fs.createDir(paths.join('/'), successCallback, newDirEntry);
            },
            function() {
                MM.popErrorMessage("Critial error accessing file system") 
             });
    }
}