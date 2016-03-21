//
//  MainController.swift
//  WildWordWest
//
//  Created by Pierre on 20/03/16.
//  Copyright © 2016 PierreRAFFA. All rights reserved.
//

import UIKit
import GameKit

class MainController: NSObject, GKGameCenterControllerDelegate {
    
    static let instance = MainController()
    
    /** Contains all player informations from GameCenter */
    private var _gameCenterPlayer: GKLocalPlayer;
    
    /** Specifies if the GameCenter is enable */
    private var _gameCenterEnable = Bool();
    
    /** LeaderBoardId */
    private var _gameCenterLeaderBoardId: String? = String()
    
    
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// FOR SINGLETON
    private override init() {
        self._gameCenterPlayer = GKLocalPlayer.localPlayer();
    }
    
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// AUTHENTICATION
    /**
        Authenticates the user by calling the gameCenter, then get the user informations from the server.
        @param viewController The view to display the gamecenter login page
    */
    func authenticate(viewController: UIViewController) {
        self.authenticateToGameCenter(viewController);
    }
    
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// GAME CENTER AUTHENTICATION
    /**
        Authenticates to the gameCenter
        @param viewController The view to display the gamecenter login page
     */
    private func authenticateToGameCenter(viewController: UIViewController) {
        
        self._gameCenterPlayer.authenticateHandler = {(ViewController, error) -> Void in
            if((ViewController) != nil) {
                // Show login if player is not logged in
                viewController.presentViewController(ViewController!, animated: true, completion: nil)
            } else if (self._gameCenterPlayer.authenticated) {
                // Player is already authenticated & logged in, load game center
                self._gameCenterEnable = true
                
                // Get the default leaderboard ID
                self._gameCenterPlayer.loadDefaultLeaderboardIdentifierWithCompletionHandler({ (leaderboardIdentifer: String?, error: NSError?) -> Void in
                    if error != nil {
                        print(error)
                    } else {
                        print("authenticated after login");
                        self._gameCenterLeaderBoardId = leaderboardIdentifer;
                        self._getUserInformations();
                    }
                })
                
                
            } else {
                // 3 Game center is not enabled on the users device
                self._gameCenterEnable = false
                print("Local player could not be authenticated, disabling game center")
                print(error);
            }
            
        }
    }
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// GET USER INFORMATIONS
    private func _getUserInformations() {
        print("_getUserInformations");
        
        let url = NSURL(string:"https://localhost:3000/accounts/ios/")
        
        let task = NSURLSession.sharedSession().dataTaskWithURL(url!) {
            (responseData, responseUrl, error) -> Void in
            
            //force the thread to render
            //dispatch_async(dispatch_get_main_queue(), { () -> Void in
                
                // if responseData is not null...
                if let data = responseData{
                    
                    if(error != nil) {
                        print(error!.localizedDescription)
                    }
                    
                    let results: AnyObject?;
                    do  {
                        results = try NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.AllowFragments);
                    }catch _ {
                        results = nil;
                    }

                    print(results);
                    
                    
                    NSNotificationCenter.defaultCenter().postNotificationName(
                        GameEvent.AuthenticationSuccess.rawValue,
                        object: nil);
                    
                }
            //});
        }
        task.resume();
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    @objc func gameCenterViewControllerDidFinish(gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismissViewControllerAnimated(true, completion: nil)
    }
}