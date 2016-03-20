//
//  GameViewController.swift
//  WildWordWest
//
//  Created by Pierre on 19/03/16.
//  Copyright (c) 2016 PierreRAFFA. All rights reserved.
//

import UIKit
import SpriteKit
import GameKit

class SplashscreenViewController: UIViewController {
    
    var score: Int = 0 // Stores the score
    
    var gcEnabled = Bool() // Stores if the user has Game Center enabled
    var gcDefaultLeaderBoard: String? = String() // Stores the default leaderboardID

    ////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////// ON LOAD
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "authenticationSuccess:",
            name: GameEvent.AuthenticationSuccess.rawValue,
            object: nil);
        NSNotificationCenter.defaultCenter().addObserver(
            self,
            selector: "authenticationFailed:",
            name: GameEvent.AuthenticationFailed.rawValue,
            object: nil);
        
        MainController.instance.authenticate(self);
        /*
        let scene = GameScene(size: view.bounds.size)
        let skView = view as! SKView
        skView.showsFPS = true
        skView.showsNodeCount = true
        skView.ignoresSiblingOrder = true
        scene.scaleMode = .ResizeFill
        skView.presentScene(scene);
        */
    }
    
    func authenticationSuccess(notification: NSNotification) {
        print("authenticationSuccess");
    }
    func authenticationFailed(notification: NSNotification) {
        print("authenticationFailed");
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }
}