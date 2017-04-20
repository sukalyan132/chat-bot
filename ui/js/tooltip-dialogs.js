/*
 * Copyright © 2016 I.B.M. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* The TooltipDialogs module handles the display and behavior of the dialog boxes
 * that are used to introduce new users to the system.
 */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^TooltipDialogs$" }] */
/* global Common: true, Conversation: true, Api: true */
var TooltipDialogs = (function() {
  'use strict';
 
  // Publicly accessible methods defined
  return {
    init: init,
  };

  // Initilialize the TooltipDialogs module
  function init() {
               Api.initConversation(''); // Load initial Watson greeting after overlays are gone.
               Conversation.focusInput();
  }

 
  
}());

 