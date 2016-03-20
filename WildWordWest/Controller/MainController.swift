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
    
    /** Specifies if the gameCenter is enable */
    var gameCenterEnable = Bool();
    
    /** LeaderBoardId */
    var gameCenterLeaderBoardId: String? = String()
    
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// FOR SINGLETON
    private override init() {}
    
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
        let localPlayer: GKLocalPlayer = GKLocalPlayer.localPlayer()
        
        localPlayer.authenticateHandler = {(ViewController, error) -> Void in
            if((ViewController) != nil) {
                // Show login if player is not logged in
                viewController.presentViewController(ViewController!, animated: true, completion: nil)
            } else if (localPlayer.authenticated) {
                // Player is already authenticated & logged in, load game center
                //self.gcEnabled = true
                
                // Get the default leaderboard ID
                localPlayer.loadDefaultLeaderboardIdentifierWithCompletionHandler({ (leaderboardIdentifer: String?, error: NSError?) -> Void in
                    if error != nil {
                        print(error)
                    } else {
                        print("authenticated after login");
                        self.gameCenterLeaderBoardId = leaderboardIdentifer;
                        self._getUserInformations();
                    }
                })
                
                
            } else {
                // 3 Game center is not enabled on the users device
                //self.gcEnabled = false
                print("Local player could not be authenticated, disabling game center")
                print(error);
            }
            
        }
    }
    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// GET USER INFORMATIONS
    private func _getUserInformations() {
        print("_getUserInformations");
        
        
        NSNotificationCenter.defaultCenter().postNotificationName(
            GameEvent.AuthenticationSuccess.rawValue,
            object: nil);
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    @objc func gameCenterViewControllerDidFinish(gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismissViewControllerAnimated(true, completion: nil)
    }
}