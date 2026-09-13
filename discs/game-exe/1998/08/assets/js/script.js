      const DEFAULT_SOUND_VOLUME = 0.15;
      function createAudio(src) {
        const audio = new Audio(src);
        audio.volume = DEFAULT_SOUND_VOLUME;
        return audio;
      }
    

      const image = document.getElementById("upper-main-image");
      const upperMain = document.getElementById("upper-main");

      const imagePath = "assets/img/ui/";
      const hoverFrames = [
        "upper-main.webp",
        "upper-main1.webp",
        "upper-main2.webp",
        "upper-main3.webp",
        "upper-main4.webp",
        "upper-main5.webp",
        "upper-main6.webp",
      ];
      const clickFrames = [
        "upper-main-click1.webp",
        "upper-main-click2.webp",
        "upper-main-click3.webp",
        "upper-main-click4.webp",
      ];
      const preClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const closeSound = createAudio("assets/sound/close.wav");
      const ringoutSound = createAudio("assets/sound/ringout.wav");
      closeSound.preload = "auto";
      ringoutSound.preload = "auto";

      const hoverFrameDelay = 145;
      const clickFrameDelay = 220;
      let hoverFrame = 0;
      let mode = "normal";
      let animationTimer = null;

      function preloadImages() {
        [...hoverFrames, ...clickFrames, ...preClickFrames].forEach((filename) => {
          const preloadedImage = new Image();
          preloadedImage.src = imagePath + filename;
        });
      }

      function showHoverFrame(index) {
        hoverFrame = index;
        image.src = imagePath + hoverFrames[index];
      }

      function stopAnimation() {
        if (animationTimer !== null) {
          clearTimeout(animationTimer);
          animationTimer = null;
        }
      }

      function animateHoverTo(targetFrame) {
        stopAnimation();

        if (hoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > hoverFrame ? 1 : -1;

        function nextFrame() {
          hoverFrame += step;
          showHoverFrame(hoverFrame);

          if (hoverFrame !== targetFrame) {
            animationTimer = setTimeout(nextFrame, hoverFrameDelay);
          } else {
            animationTimer = null;
          }
        }

        animationTimer = setTimeout(nextFrame, hoverFrameDelay);
      }

      const preClickFrameDelay = 150;

      function playPreClickAnimation(onDone) {
        stopAnimation();

        let frameIndex = 0;
        image.src = imagePath + preClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          image.src = imagePath + preClickFrames[frameIndex];

          if (frameIndex < preClickFrames.length - 1) {
            animationTimer = setTimeout(nextFrame, preClickFrameDelay);
          } else {
            animationTimer = null;
            onDone();
          }
        }

        animationTimer = setTimeout(nextFrame, preClickFrameDelay);
      }

      function playClickAnimation() {
        stopAnimation();
        mode = "clicked";

        ringoutSound.currentTime = 0;
        ringoutSound.play().catch(() => {});

        let clickFrame = 0;
        image.src = imagePath + clickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame += 1;
          image.src = imagePath + clickFrames[clickFrame];

          if (clickFrame < clickFrames.length - 1) {
            animationTimer = setTimeout(nextClickFrame, clickFrameDelay);
          } else {
            animationTimer = null;
          }
        }

        animationTimer = setTimeout(nextClickFrame, clickFrameDelay);
      }

      upperMain.addEventListener("mouseenter", () => {
        if (mode !== "normal") {
          return;
        }

        closeSound.currentTime = 0;
        closeSound.play().catch(() => {});
        animateHoverTo(hoverFrames.length - 1);
      });

      upperMain.addEventListener("mouseleave", () => {
        if (mode === "normal") {
          animateHoverTo(0);
        }
      });

      upperMain.addEventListener("click", () => {
        if (mode === "normal") {
          mode = "clicked";
          playPreClickAnimation(() => playClickAnimation());
          return;
        }

        if (mode === "clicked") {
          stopAnimation();
          mode = "normal";
          showHoverFrame(hoverFrames.length - 1);
        }
      });

      preloadImages();
    

      const clangSound = createAudio("assets/sound/clang.wav");
      const openSound = createAudio("assets/sound/open.wav");
      clangSound.preload = "auto";
      openSound.preload = "auto";

      const buttonImagePath = "assets/img/ui/";
      const buttonDefaultFrame = "button.webp";
      const buttonEnterFrames = ["button1.webp", "button2.webp", "button3.webp"];
      const buttonHoverLoopFrames = [
        "button-hover1.webp",
        "button-hover2.webp",
        "button-hover3.webp",
        "button-hover4.webp",
        "button-hover5.webp",
        "button-hover6.webp",
      ];
      const buttonClickFrames = ["button-click1.webp", "button-click2.webp", "button-click3.webp"];

      const buttonEnterFrameDelay = 500 / buttonEnterFrames.length;
      const buttonHoverLoopFrameDelay = 200;
      const buttonClickFrameDelay = 200;

      function setupSectionButton(img) {
        let timer = null;
        let state = "idle";
        let hasClickedThisHover = false;

        function clearTimer() {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        }

        function startHoverLoop() {
          state = "hoverLoop";
          let loopIndex = 0;

          function nextLoopFrame() {
            img.src = buttonImagePath + buttonHoverLoopFrames[loopIndex];
            loopIndex = (loopIndex + 1) % buttonHoverLoopFrames.length;
            timer = setTimeout(nextLoopFrame, buttonHoverLoopFrameDelay);
          }

          nextLoopFrame();
        }

        function playEnterSequence() {
          clearTimer();
          state = "entering";
          clangSound.currentTime = 0;
          clangSound.play().catch(() => {});

          let frameIndex = 0;
          function nextFrame() {
            img.src = buttonImagePath + buttonEnterFrames[frameIndex];
            frameIndex += 1;
            if (frameIndex < buttonEnterFrames.length) {
              timer = setTimeout(nextFrame, buttonEnterFrameDelay);
            } else {
              startHoverLoop();
            }
          }
          nextFrame();
        }

        function playLeaveSequence() {
          clearTimer();
          state = "leaving";
          const reversedFrames = [...buttonEnterFrames].reverse();

          let frameIndex = 0;
          function nextFrame() {
            img.src = buttonImagePath + reversedFrames[frameIndex];
            frameIndex += 1;
            if (frameIndex < reversedFrames.length) {
              timer = setTimeout(nextFrame, buttonEnterFrameDelay);
            } else {
              img.src = buttonImagePath + buttonDefaultFrame;
              state = "idle";
            }
          }
          nextFrame();
        }

        function playClickSequence() {
          clearTimer();
          state = "clicking";
          openSound.currentTime = 0;
          openSound.play().catch(() => {});

          let frameIndex = 0;
          function nextFrame() {
            img.src = buttonImagePath + buttonClickFrames[frameIndex];
            frameIndex += 1;
            if (frameIndex < buttonClickFrames.length) {
              timer = setTimeout(nextFrame, buttonClickFrameDelay);
            } else {
              img.src = buttonImagePath + buttonDefaultFrame;
              state = "idle";
            }
          }
          nextFrame();
        }

        img.addEventListener("mouseenter", () => {
          if (state === "clicking") {
            return;
          }
          hasClickedThisHover = false;
          playEnterSequence();
        });

        img.addEventListener("mouseleave", () => {
          if (state === "clicking" || hasClickedThisHover) {
            return;
          }
          playLeaveSequence();
        });

        img.addEventListener("click", () => {
          hasClickedThisHover = true;
          playClickSequence();
        });
      }

      document.querySelectorAll(".section-button").forEach(setupSectionButton);
    

      const backImage = document.getElementById("back-button-image");
      const backButton = document.getElementById("back-button");

      const backImagePath = "assets/img/ui/";
      const backDefaultFrame = "back.webp";
      const backHoverFrames = ["back1.webp", "back2.webp", "back3.webp"];
      const backClickFrames = ["back-click1.webp", "back-click2.webp", "back-click3.webp"];

      const backHoverFrameDelay = 200;
      const backClickFrameDelay = 200;

      const bouncedSound = createAudio("assets/sound/bounced.wav");
      const backOpenSound = createAudio("assets/sound/open.wav");
      bouncedSound.preload = "auto";
      backOpenSound.preload = "auto";

      let backTimer = null;
      let backState = "idle";

      function clearBackTimer() {
        if (backTimer !== null) {
          clearTimeout(backTimer);
          backTimer = null;
        }
      }

      function playBackHoverSequence() {
        clearBackTimer();
        backState = "hovering";
        bouncedSound.currentTime = 0;
        bouncedSound.play().catch(() => {});

        let frameIndex = 0;
        function nextFrame() {
          backImage.src = backImagePath + backHoverFrames[frameIndex];
          frameIndex += 1;
          if (frameIndex < backHoverFrames.length) {
            backTimer = setTimeout(nextFrame, backHoverFrameDelay);
          }
        }
        nextFrame();
      }

      function playBackLeaveSequence() {
        clearBackTimer();
        backState = "leaving";
        const reversedFrames = [...backHoverFrames].reverse();

        let frameIndex = 0;
        function nextFrame() {
          backImage.src = backImagePath + reversedFrames[frameIndex];
          frameIndex += 1;
          if (frameIndex < reversedFrames.length) {
            backTimer = setTimeout(nextFrame, backHoverFrameDelay);
          } else {
            backImage.src = backImagePath + backDefaultFrame;
            backState = "idle";
          }
        }
        nextFrame();
      }

      function playBackClickSequence() {
        clearBackTimer();
        backState = "clicking";
        backOpenSound.currentTime = 0;
        backOpenSound.play().catch(() => {});

        let frameIndex = 0;
        function nextFrame() {
          backImage.src = backImagePath + backClickFrames[frameIndex];
          frameIndex += 1;
          if (frameIndex < backClickFrames.length) {
            backTimer = setTimeout(nextFrame, backClickFrameDelay);
          } else {
            backState = "clicked";
            backTimer = setTimeout(() => {
              backImage.src = backImagePath + backDefaultFrame;
              backState = "idle";
            }, 500);
          }
        }
        nextFrame();
      }

      backButton.addEventListener("mouseenter", () => {
        if (backState === "clicking" || backState === "clicked") {
          return;
        }
        playBackHoverSequence();
      });

      backButton.addEventListener("mouseleave", () => {
        if (backState === "clicking" || backState === "clicked") {
          return;
        }
        playBackLeaveSequence();
      });

      backButton.addEventListener("click", () => {
        playBackClickSequence();
        if (typeof currentPage !== "undefined" && currentPage !== "page-main") {
          showPage("page-main");
        }
      });
    

      const exitImage = document.getElementById("exit-button-image");
      const exitButton = document.getElementById("exit-button");

      const exitImagePath = "assets/img/ui/";
      const exitDefaultFrame = "exit.webp";
      const exitEnterFrames = ["exit1.webp", "exit2.webp"];
      const exitHoverLoopFrames = ["exit-hover1.webp", "exit-hover2.webp", "exit-hover3.webp"];

      const exitEnterFrameDelay = 200;
      const exitHoverLoopFrameDelay = 500 / exitHoverLoopFrames.length;

      const exitBouncedSound = createAudio("assets/sound/bounced.wav");
      exitBouncedSound.preload = "auto";

      let exitTimer = null;
      let exitState = "idle";

      function clearExitTimer() {
        if (exitTimer !== null) {
          clearTimeout(exitTimer);
          exitTimer = null;
        }
      }

      function startExitHoverLoop() {
        exitState = "hoverLoop";
        let loopIndex = 0;

        function nextLoopFrame() {
          exitImage.src = exitImagePath + exitHoverLoopFrames[loopIndex];
          loopIndex = (loopIndex + 1) % exitHoverLoopFrames.length;
          exitTimer = setTimeout(nextLoopFrame, exitHoverLoopFrameDelay);
        }

        nextLoopFrame();
      }

      function playExitEnterSequence() {
        clearExitTimer();
        exitState = "entering";
        exitBouncedSound.currentTime = 0;
        exitBouncedSound.play().catch(() => {});

        let frameIndex = 0;
        function nextFrame() {
          exitImage.src = exitImagePath + exitEnterFrames[frameIndex];
          frameIndex += 1;
          if (frameIndex < exitEnterFrames.length) {
            exitTimer = setTimeout(nextFrame, exitEnterFrameDelay);
          } else {
            startExitHoverLoop();
          }
        }
        nextFrame();
      }

      function playExitLeaveSequence() {
        clearExitTimer();
        exitState = "leaving";
        const reversedFrames = [...exitEnterFrames].reverse();

        let frameIndex = 0;
        function nextFrame() {
          exitImage.src = exitImagePath + reversedFrames[frameIndex];
          frameIndex += 1;
          if (frameIndex < reversedFrames.length) {
            exitTimer = setTimeout(nextFrame, exitEnterFrameDelay);
          } else {
            exitImage.src = exitImagePath + exitDefaultFrame;
            exitState = "idle";
          }
        }
        nextFrame();
      }

      exitButton.addEventListener("mouseenter", () => {
        playExitEnterSequence();
      });

      exitButton.addEventListener("mouseleave", () => {
        playExitLeaveSequence();
      });

      exitButton.addEventListener("click", () => {
        playSplashSequence();
      });
    

      let currentPage = "page-main";

      const sideNavConfig = {
        "page-upravdem": {
          left: ["s-menu", "s-patches", "s-demo"],
          right: ["s-share", "s-bonus", "s-exe"],
        },
        "page-patches": {
          left: ["s-menu", "s-demo", "s-util"],
          right: ["s-share", "s-bonus", "s-exe"],
        },
        "page-util": {
          left: ["s-menu", "s-patches", "s-demo"],
          right: ["s-share", "s-bonus", "s-exe"],
        },
        "page-share": {
          left: ["s-menu", "s-patches", "s-util"],
          right: ["s-demo", "s-bonus", "s-exe"],
        },
        "page-bonus": {
          left: ["s-menu", "s-patches", "s-util"],
          right: ["s-share", "s-demo", "s-exe"],
        },
        "page-via": {
          left: ["s-menu", "s-patches", "s-util"],
          right: ["s-bonus", "s-share", "s-demo"],
        },
      };

      function applySideNavConfig(pageId) {
        const config = sideNavConfig[pageId];
        if (!config) {
          return;
        }

        function applyColumn(ids, bases) {
          ids.forEach((id, index) => {
            const el = document.getElementById(id);
            el.dataset.base = bases[index];
            el.style.opacity = "0";
            el.src = "assets/img/ui/" + bases[index] + "1.webp";
          });
        }

        applyColumn(["side-left-1", "side-left-2", "side-left-3"], config.left);
        applyColumn(["side-right-1", "side-right-2", "side-right-3"], config.right);
      }

      function showPage(pageId) {
        document.querySelectorAll(".page").forEach((page) => {
          page.hidden = page.id !== pageId;
        });
        document.getElementById("side-nav").hidden = pageId === "page-main";
        applySideNavConfig(pageId);
        currentPage = pageId;
      }

      document.getElementById("menu-button-upravdem").addEventListener("click", () => {
        showPage("page-upravdem");
      });

      document.getElementById("menu-button-patches").addEventListener("click", () => {
        showPage("page-patches");
      });

      document.getElementById("menu-button-util").addEventListener("click", () => {
        showPage("page-util");
      });

      document.getElementById("menu-button-share").addEventListener("click", () => {
        showPage("page-share");
      });

      document.getElementById("menu-button-bonus").addEventListener("click", () => {
        showPage("page-bonus");
      });

      document.getElementById("menu-button-via").addEventListener("click", () => {
        showPage("page-via");
      });
    

      const upperDemoImage = document.getElementById("upper-demo-image");
      const upperDemo = document.getElementById("upper-demo");

      const upperDemoImagePath = "assets/img/ui/";
      const upperDemoHoverFrames = [
        "upper-demo.webp",
        "upper-demo1.webp",
        "upper-demo2.webp",
        "upper-demo3.webp",
        "upper-demo4.webp",
        "upper-demo5.webp",
        "upper-demo6.webp",
      ];
      const upperDemoClickFrames = [
        "upper-demo-click1.webp",
        "upper-demo-click2.webp",
        "upper-demo-click3.webp",
        "upper-demo-click4.webp",
        "upper-demo-click5.webp",
        "upper-demo-click6.webp",
        "upper-demo-click7.webp",
        "upper-demo-click8.webp",
        "upper-demo-click9.webp",
      ];
      const upperDemoPreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperDemoCloseSound = createAudio("assets/sound/close.wav");
      const upperDemoRingoutSound = createAudio("assets/sound/ringout.wav");
      upperDemoCloseSound.preload = "auto";
      upperDemoRingoutSound.preload = "auto";

      const upperDemoHoverFrameDelay = 145;
      const upperDemoClickFrameDelay = 220;
      let upperDemoHoverFrame = 0;
      let upperDemoMode = "normal";
      let upperDemoAnimationTimer = null;

      const upperDemoPreClickFrameDelay = 150;

      function preloadUpperDemoImages() {
        [...upperDemoHoverFrames, ...upperDemoClickFrames, ...upperDemoPreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperDemoImagePath + filename;
          }
        );
      }

      function showUpperDemoHoverFrame(index) {
        upperDemoHoverFrame = index;
        upperDemoImage.src = upperDemoImagePath + upperDemoHoverFrames[index];
      }

      function stopUpperDemoAnimation() {
        if (upperDemoAnimationTimer !== null) {
          clearTimeout(upperDemoAnimationTimer);
          upperDemoAnimationTimer = null;
        }
      }

      function animateUpperDemoHoverTo(targetFrame) {
        stopUpperDemoAnimation();

        if (upperDemoHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperDemoHoverFrame ? 1 : -1;

        function nextFrame() {
          upperDemoHoverFrame += step;
          showUpperDemoHoverFrame(upperDemoHoverFrame);

          if (upperDemoHoverFrame !== targetFrame) {
            upperDemoAnimationTimer = setTimeout(nextFrame, upperDemoHoverFrameDelay);
          } else {
            upperDemoAnimationTimer = null;
          }
        }

        upperDemoAnimationTimer = setTimeout(nextFrame, upperDemoHoverFrameDelay);
      }

      function playUpperDemoPreClickAnimation(onDone) {
        stopUpperDemoAnimation();

        let frameIndex = 0;
        upperDemoImage.src = upperDemoImagePath + upperDemoPreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperDemoImage.src = upperDemoImagePath + upperDemoPreClickFrames[frameIndex];

          if (frameIndex < upperDemoPreClickFrames.length - 1) {
            upperDemoAnimationTimer = setTimeout(nextFrame, upperDemoPreClickFrameDelay);
          } else {
            upperDemoAnimationTimer = null;
            onDone();
          }
        }

        upperDemoAnimationTimer = setTimeout(nextFrame, upperDemoPreClickFrameDelay);
      }

      function playUpperDemoClickAnimation() {
        stopUpperDemoAnimation();
        upperDemoMode = "clicked";

        upperDemoRingoutSound.currentTime = 0;
        upperDemoRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperDemoImage.src = upperDemoImagePath + upperDemoClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperDemoClickFrames.length;
          upperDemoImage.src = upperDemoImagePath + upperDemoClickFrames[clickFrame];
          upperDemoAnimationTimer = setTimeout(nextClickFrame, upperDemoClickFrameDelay);
        }

        upperDemoAnimationTimer = setTimeout(nextClickFrame, upperDemoClickFrameDelay);
      }

      upperDemo.addEventListener("mouseenter", () => {
        if (upperDemoMode !== "normal") {
          return;
        }

        upperDemoCloseSound.currentTime = 0;
        upperDemoCloseSound.play().catch(() => {});
        animateUpperDemoHoverTo(upperDemoHoverFrames.length - 1);
      });

      upperDemo.addEventListener("mouseleave", () => {
        if (upperDemoMode === "normal") {
          animateUpperDemoHoverTo(0);
        }
      });

      upperDemo.addEventListener("click", () => {
        if (upperDemoMode === "normal") {
          upperDemoMode = "clicked";
          playUpperDemoPreClickAnimation(() => playUpperDemoClickAnimation());
          return;
        }

        if (upperDemoMode === "clicked") {
          stopUpperDemoAnimation();
          upperDemoMode = "normal";
          showUpperDemoHoverFrame(upperDemoHoverFrames.length - 1);
        }
      });

      preloadUpperDemoImages();
    

      const upperPatchImage = document.getElementById("upper-patch-image");
      const upperPatch = document.getElementById("upper-patch");

      const upperPatchImagePath = "assets/img/ui/";
      const upperPatchHoverFrames = [
        "upper-patch.webp",
        "upper-patch1.webp",
        "upper-patch2.webp",
        "upper-patch3.webp",
        "upper-patch4.webp",
        "upper-patch5.webp",
        "upper-patch6.webp",
      ];
      const upperPatchClickFrames = [
        "upper-patch-click1.webp",
        "upper-patch-click2.webp",
        "upper-patch-click3.webp",
        "upper-patch-click4.webp",
      ];
      const upperPatchPreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperPatchCloseSound = createAudio("assets/sound/close.wav");
      const upperPatchRingoutSound = createAudio("assets/sound/ringout.wav");
      upperPatchCloseSound.preload = "auto";
      upperPatchRingoutSound.preload = "auto";

      const upperPatchHoverFrameDelay = 145;
      const upperPatchClickFrameDelay = 220;
      const upperPatchPreClickFrameDelay = 150;
      let upperPatchHoverFrame = 0;
      let upperPatchMode = "normal";
      let upperPatchAnimationTimer = null;

      function preloadUpperPatchImages() {
        [...upperPatchHoverFrames, ...upperPatchClickFrames, ...upperPatchPreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperPatchImagePath + filename;
          }
        );
      }

      function showUpperPatchHoverFrame(index) {
        upperPatchHoverFrame = index;
        upperPatchImage.src = upperPatchImagePath + upperPatchHoverFrames[index];
      }

      function stopUpperPatchAnimation() {
        if (upperPatchAnimationTimer !== null) {
          clearTimeout(upperPatchAnimationTimer);
          upperPatchAnimationTimer = null;
        }
      }

      function animateUpperPatchHoverTo(targetFrame) {
        stopUpperPatchAnimation();

        if (upperPatchHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperPatchHoverFrame ? 1 : -1;

        function nextFrame() {
          upperPatchHoverFrame += step;
          showUpperPatchHoverFrame(upperPatchHoverFrame);

          if (upperPatchHoverFrame !== targetFrame) {
            upperPatchAnimationTimer = setTimeout(nextFrame, upperPatchHoverFrameDelay);
          } else {
            upperPatchAnimationTimer = null;
          }
        }

        upperPatchAnimationTimer = setTimeout(nextFrame, upperPatchHoverFrameDelay);
      }

      function playUpperPatchPreClickAnimation(onDone) {
        stopUpperPatchAnimation();

        let frameIndex = 0;
        upperPatchImage.src = upperPatchImagePath + upperPatchPreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperPatchImage.src = upperPatchImagePath + upperPatchPreClickFrames[frameIndex];

          if (frameIndex < upperPatchPreClickFrames.length - 1) {
            upperPatchAnimationTimer = setTimeout(nextFrame, upperPatchPreClickFrameDelay);
          } else {
            upperPatchAnimationTimer = null;
            onDone();
          }
        }

        upperPatchAnimationTimer = setTimeout(nextFrame, upperPatchPreClickFrameDelay);
      }

      function playUpperPatchClickAnimation() {
        stopUpperPatchAnimation();
        upperPatchMode = "clicked";

        upperPatchRingoutSound.currentTime = 0;
        upperPatchRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperPatchImage.src = upperPatchImagePath + upperPatchClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperPatchClickFrames.length;
          upperPatchImage.src = upperPatchImagePath + upperPatchClickFrames[clickFrame];
          upperPatchAnimationTimer = setTimeout(nextClickFrame, upperPatchClickFrameDelay);
        }

        upperPatchAnimationTimer = setTimeout(nextClickFrame, upperPatchClickFrameDelay);
      }

      upperPatch.addEventListener("mouseenter", () => {
        if (upperPatchMode !== "normal") {
          return;
        }

        upperPatchCloseSound.currentTime = 0;
        upperPatchCloseSound.play().catch(() => {});
        animateUpperPatchHoverTo(upperPatchHoverFrames.length - 1);
      });

      upperPatch.addEventListener("mouseleave", () => {
        if (upperPatchMode === "normal") {
          animateUpperPatchHoverTo(0);
        }
      });

      upperPatch.addEventListener("click", () => {
        if (upperPatchMode === "normal") {
          upperPatchMode = "clicked";
          playUpperPatchPreClickAnimation(() => playUpperPatchClickAnimation());
          return;
        }

        if (upperPatchMode === "clicked") {
          stopUpperPatchAnimation();
          upperPatchMode = "normal";
          showUpperPatchHoverFrame(upperPatchHoverFrames.length - 1);
        }
      });

      preloadUpperPatchImages();
    

      const upperUtilImage = document.getElementById("upper-util-image");
      const upperUtil = document.getElementById("upper-util");

      const upperUtilImagePath = "assets/img/ui/";
      const upperUtilHoverFrames = [
        "upper-util.webp",
        "upper-util1.webp",
        "upper-util2.webp",
        "upper-util3.webp",
        "upper-util4.webp",
        "upper-util5.webp",
        "upper-util6.webp",
      ];
      const upperUtilClickFrames = [
        "upper-util-click1.webp",
        "upper-util-click2.webp",
        "upper-util-click3.webp",
        "upper-util-click4.webp",
        "upper-util-click5.webp",
        "upper-util-click6.webp",
      ];
      const upperUtilPreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperUtilCloseSound = createAudio("assets/sound/close.wav");
      const upperUtilRingoutSound = createAudio("assets/sound/ringout.wav");
      upperUtilCloseSound.preload = "auto";
      upperUtilRingoutSound.preload = "auto";

      const upperUtilHoverFrameDelay = 145;
      const upperUtilClickFrameDelay = 220;
      const upperUtilPreClickFrameDelay = 150;
      let upperUtilHoverFrame = 0;
      let upperUtilMode = "normal";
      let upperUtilAnimationTimer = null;

      function preloadUpperUtilImages() {
        [...upperUtilHoverFrames, ...upperUtilClickFrames, ...upperUtilPreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperUtilImagePath + filename;
          }
        );
      }

      function showUpperUtilHoverFrame(index) {
        upperUtilHoverFrame = index;
        upperUtilImage.src = upperUtilImagePath + upperUtilHoverFrames[index];
      }

      function stopUpperUtilAnimation() {
        if (upperUtilAnimationTimer !== null) {
          clearTimeout(upperUtilAnimationTimer);
          upperUtilAnimationTimer = null;
        }
      }

      function animateUpperUtilHoverTo(targetFrame) {
        stopUpperUtilAnimation();

        if (upperUtilHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperUtilHoverFrame ? 1 : -1;

        function nextFrame() {
          upperUtilHoverFrame += step;
          showUpperUtilHoverFrame(upperUtilHoverFrame);

          if (upperUtilHoverFrame !== targetFrame) {
            upperUtilAnimationTimer = setTimeout(nextFrame, upperUtilHoverFrameDelay);
          } else {
            upperUtilAnimationTimer = null;
          }
        }

        upperUtilAnimationTimer = setTimeout(nextFrame, upperUtilHoverFrameDelay);
      }

      function playUpperUtilPreClickAnimation(onDone) {
        stopUpperUtilAnimation();

        let frameIndex = 0;
        upperUtilImage.src = upperUtilImagePath + upperUtilPreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperUtilImage.src = upperUtilImagePath + upperUtilPreClickFrames[frameIndex];

          if (frameIndex < upperUtilPreClickFrames.length - 1) {
            upperUtilAnimationTimer = setTimeout(nextFrame, upperUtilPreClickFrameDelay);
          } else {
            upperUtilAnimationTimer = null;
            onDone();
          }
        }

        upperUtilAnimationTimer = setTimeout(nextFrame, upperUtilPreClickFrameDelay);
      }

      function playUpperUtilClickAnimation() {
        stopUpperUtilAnimation();
        upperUtilMode = "clicked";

        upperUtilRingoutSound.currentTime = 0;
        upperUtilRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperUtilImage.src = upperUtilImagePath + upperUtilClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperUtilClickFrames.length;
          upperUtilImage.src = upperUtilImagePath + upperUtilClickFrames[clickFrame];
          upperUtilAnimationTimer = setTimeout(nextClickFrame, upperUtilClickFrameDelay);
        }

        upperUtilAnimationTimer = setTimeout(nextClickFrame, upperUtilClickFrameDelay);
      }

      upperUtil.addEventListener("mouseenter", () => {
        if (upperUtilMode !== "normal") {
          return;
        }

        upperUtilCloseSound.currentTime = 0;
        upperUtilCloseSound.play().catch(() => {});
        animateUpperUtilHoverTo(upperUtilHoverFrames.length - 1);
      });

      upperUtil.addEventListener("mouseleave", () => {
        if (upperUtilMode === "normal") {
          animateUpperUtilHoverTo(0);
        }
      });

      upperUtil.addEventListener("click", () => {
        if (upperUtilMode === "normal") {
          upperUtilMode = "clicked";
          playUpperUtilPreClickAnimation(() => playUpperUtilClickAnimation());
          return;
        }

        if (upperUtilMode === "clicked") {
          stopUpperUtilAnimation();
          upperUtilMode = "normal";
          showUpperUtilHoverFrame(upperUtilHoverFrames.length - 1);
        }
      });

      preloadUpperUtilImages();
    

      const upperShareImage = document.getElementById("upper-share-image");
      const upperShare = document.getElementById("upper-share");

      const upperShareImagePath = "assets/img/ui/";
      const upperShareHoverFrames = [
        "upper-share.webp",
        "upper-share1.webp",
        "upper-share2.webp",
        "upper-share3.webp",
        "upper-share4.webp",
        "upper-share5.webp",
        "upper-share6.webp",
      ];
      const upperShareClickFrames = [
        "upper-share-click1.webp",
        "upper-share-click2.webp",
        "upper-share-click3.webp",
        "upper-share-click4.webp",
        "upper-share-click5.webp",
        "upper-share-click6.webp",
      ];
      const upperSharePreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperShareCloseSound = createAudio("assets/sound/close.wav");
      const upperShareRingoutSound = createAudio("assets/sound/ringout.wav");
      upperShareCloseSound.preload = "auto";
      upperShareRingoutSound.preload = "auto";

      const upperShareHoverFrameDelay = 145;
      const upperShareClickFrameDelay = 220;
      const upperSharePreClickFrameDelay = 150;
      let upperShareHoverFrame = 0;
      let upperShareMode = "normal";
      let upperShareAnimationTimer = null;

      function preloadUpperShareImages() {
        [...upperShareHoverFrames, ...upperShareClickFrames, ...upperSharePreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperShareImagePath + filename;
          }
        );
      }

      function showUpperShareHoverFrame(index) {
        upperShareHoverFrame = index;
        upperShareImage.src = upperShareImagePath + upperShareHoverFrames[index];
      }

      function stopUpperShareAnimation() {
        if (upperShareAnimationTimer !== null) {
          clearTimeout(upperShareAnimationTimer);
          upperShareAnimationTimer = null;
        }
      }

      function animateUpperShareHoverTo(targetFrame) {
        stopUpperShareAnimation();

        if (upperShareHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperShareHoverFrame ? 1 : -1;

        function nextFrame() {
          upperShareHoverFrame += step;
          showUpperShareHoverFrame(upperShareHoverFrame);

          if (upperShareHoverFrame !== targetFrame) {
            upperShareAnimationTimer = setTimeout(nextFrame, upperShareHoverFrameDelay);
          } else {
            upperShareAnimationTimer = null;
          }
        }

        upperShareAnimationTimer = setTimeout(nextFrame, upperShareHoverFrameDelay);
      }

      function playUpperSharePreClickAnimation(onDone) {
        stopUpperShareAnimation();

        let frameIndex = 0;
        upperShareImage.src = upperShareImagePath + upperSharePreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperShareImage.src = upperShareImagePath + upperSharePreClickFrames[frameIndex];

          if (frameIndex < upperSharePreClickFrames.length - 1) {
            upperShareAnimationTimer = setTimeout(nextFrame, upperSharePreClickFrameDelay);
          } else {
            upperShareAnimationTimer = null;
            onDone();
          }
        }

        upperShareAnimationTimer = setTimeout(nextFrame, upperSharePreClickFrameDelay);
      }

      function playUpperShareClickAnimation() {
        stopUpperShareAnimation();
        upperShareMode = "clicked";

        upperShareRingoutSound.currentTime = 0;
        upperShareRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperShareImage.src = upperShareImagePath + upperShareClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperShareClickFrames.length;
          upperShareImage.src = upperShareImagePath + upperShareClickFrames[clickFrame];
          upperShareAnimationTimer = setTimeout(nextClickFrame, upperShareClickFrameDelay);
        }

        upperShareAnimationTimer = setTimeout(nextClickFrame, upperShareClickFrameDelay);
      }

      upperShare.addEventListener("mouseenter", () => {
        if (upperShareMode !== "normal") {
          return;
        }

        upperShareCloseSound.currentTime = 0;
        upperShareCloseSound.play().catch(() => {});
        animateUpperShareHoverTo(upperShareHoverFrames.length - 1);
      });

      upperShare.addEventListener("mouseleave", () => {
        if (upperShareMode === "normal") {
          animateUpperShareHoverTo(0);
        }
      });

      upperShare.addEventListener("click", () => {
        if (upperShareMode === "normal") {
          upperShareMode = "clicked";
          playUpperSharePreClickAnimation(() => playUpperShareClickAnimation());
          return;
        }

        if (upperShareMode === "clicked") {
          stopUpperShareAnimation();
          upperShareMode = "normal";
          showUpperShareHoverFrame(upperShareHoverFrames.length - 1);
        }
      });

      preloadUpperShareImages();
    

      const upperBonusImage = document.getElementById("upper-bonus-image");
      const upperBonus = document.getElementById("upper-bonus");

      const upperBonusImagePath = "assets/img/ui/";
      const upperBonusHoverFrames = [
        "upper-bonus.webp",
        "upper-bonus1.webp",
        "upper-bonus2.webp",
        "upper-bonus3.webp",
        "upper-bonus4.webp",
        "upper-bonus5.webp",
        "upper-bonus6.webp",
      ];
      const upperBonusClickFrames = [
        "upper-bonus-click1.webp",
        "upper-bonus-click2.webp",
        "upper-bonus-click3.webp",
        "upper-bonus-click4.webp",
        "upper-bonus-click5.webp",
      ];
      const upperBonusPreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperBonusCloseSound = createAudio("assets/sound/close.wav");
      const upperBonusRingoutSound = createAudio("assets/sound/ringout.wav");
      upperBonusCloseSound.preload = "auto";
      upperBonusRingoutSound.preload = "auto";

      const upperBonusHoverFrameDelay = 145;
      const upperBonusClickFrameDelay = 220;
      const upperBonusPreClickFrameDelay = 150;
      let upperBonusHoverFrame = 0;
      let upperBonusMode = "normal";
      let upperBonusAnimationTimer = null;

      function preloadUpperBonusImages() {
        [...upperBonusHoverFrames, ...upperBonusClickFrames, ...upperBonusPreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperBonusImagePath + filename;
          }
        );
      }

      function showUpperBonusHoverFrame(index) {
        upperBonusHoverFrame = index;
        upperBonusImage.src = upperBonusImagePath + upperBonusHoverFrames[index];
      }

      function stopUpperBonusAnimation() {
        if (upperBonusAnimationTimer !== null) {
          clearTimeout(upperBonusAnimationTimer);
          upperBonusAnimationTimer = null;
        }
      }

      function animateUpperBonusHoverTo(targetFrame) {
        stopUpperBonusAnimation();

        if (upperBonusHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperBonusHoverFrame ? 1 : -1;

        function nextFrame() {
          upperBonusHoverFrame += step;
          showUpperBonusHoverFrame(upperBonusHoverFrame);

          if (upperBonusHoverFrame !== targetFrame) {
            upperBonusAnimationTimer = setTimeout(nextFrame, upperBonusHoverFrameDelay);
          } else {
            upperBonusAnimationTimer = null;
          }
        }

        upperBonusAnimationTimer = setTimeout(nextFrame, upperBonusHoverFrameDelay);
      }

      function playUpperBonusPreClickAnimation(onDone) {
        stopUpperBonusAnimation();

        let frameIndex = 0;
        upperBonusImage.src = upperBonusImagePath + upperBonusPreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperBonusImage.src = upperBonusImagePath + upperBonusPreClickFrames[frameIndex];

          if (frameIndex < upperBonusPreClickFrames.length - 1) {
            upperBonusAnimationTimer = setTimeout(nextFrame, upperBonusPreClickFrameDelay);
          } else {
            upperBonusAnimationTimer = null;
            onDone();
          }
        }

        upperBonusAnimationTimer = setTimeout(nextFrame, upperBonusPreClickFrameDelay);
      }

      function playUpperBonusClickAnimation() {
        stopUpperBonusAnimation();
        upperBonusMode = "clicked";

        upperBonusRingoutSound.currentTime = 0;
        upperBonusRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperBonusImage.src = upperBonusImagePath + upperBonusClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperBonusClickFrames.length;
          upperBonusImage.src = upperBonusImagePath + upperBonusClickFrames[clickFrame];
          upperBonusAnimationTimer = setTimeout(nextClickFrame, upperBonusClickFrameDelay);
        }

        upperBonusAnimationTimer = setTimeout(nextClickFrame, upperBonusClickFrameDelay);
      }

      upperBonus.addEventListener("mouseenter", () => {
        if (upperBonusMode !== "normal") {
          return;
        }

        upperBonusCloseSound.currentTime = 0;
        upperBonusCloseSound.play().catch(() => {});
        animateUpperBonusHoverTo(upperBonusHoverFrames.length - 1);
      });

      upperBonus.addEventListener("mouseleave", () => {
        if (upperBonusMode === "normal") {
          animateUpperBonusHoverTo(0);
        }
      });

      upperBonus.addEventListener("click", () => {
        if (upperBonusMode === "normal") {
          upperBonusMode = "clicked";
          playUpperBonusPreClickAnimation(() => playUpperBonusClickAnimation());
          return;
        }

        if (upperBonusMode === "clicked") {
          stopUpperBonusAnimation();
          upperBonusMode = "normal";
          showUpperBonusHoverFrame(upperBonusHoverFrames.length - 1);
        }
      });

      preloadUpperBonusImages();
    

      const upperViaImage = document.getElementById("upper-via-image");
      const upperVia = document.getElementById("upper-via");

      const upperViaImagePath = "assets/img/ui/";
      const upperViaHoverFrames = [
        "upper-via.webp",
        "upper-via1.webp",
        "upper-via2.webp",
        "upper-via3.webp",
        "upper-via4.webp",
        "upper-via5.webp",
      ];
      const upperViaClickFrames = [
        "upper-via-click1.webp",
        "upper-via-click2.webp",
        "upper-via-click3.webp",
        "upper-via-click4.webp",
      ];
      const upperViaPreClickFrames = [
        "upper-click1.webp",
        "upper-click2.webp",
        "upper-click3.webp",
        "upper-click4.webp",
        "upper-click5.webp",
      ];

      const upperViaCloseSound = createAudio("assets/sound/close.wav");
      const upperViaRingoutSound = createAudio("assets/sound/ringout.wav");
      upperViaCloseSound.preload = "auto";
      upperViaRingoutSound.preload = "auto";

      const upperViaHoverFrameDelay = 145;
      const upperViaClickFrameDelay = 220;
      const upperViaPreClickFrameDelay = 150;
      let upperViaHoverFrame = 0;
      let upperViaMode = "normal";
      let upperViaAnimationTimer = null;

      function preloadUpperViaImages() {
        [...upperViaHoverFrames, ...upperViaClickFrames, ...upperViaPreClickFrames].forEach(
          (filename) => {
            const preloadedImage = new Image();
            preloadedImage.src = upperViaImagePath + filename;
          }
        );
      }

      function showUpperViaHoverFrame(index) {
        upperViaHoverFrame = index;
        upperViaImage.src = upperViaImagePath + upperViaHoverFrames[index];
      }

      function stopUpperViaAnimation() {
        if (upperViaAnimationTimer !== null) {
          clearTimeout(upperViaAnimationTimer);
          upperViaAnimationTimer = null;
        }
      }

      function animateUpperViaHoverTo(targetFrame) {
        stopUpperViaAnimation();

        if (upperViaHoverFrame === targetFrame) {
          return;
        }

        const step = targetFrame > upperViaHoverFrame ? 1 : -1;

        function nextFrame() {
          upperViaHoverFrame += step;
          showUpperViaHoverFrame(upperViaHoverFrame);

          if (upperViaHoverFrame !== targetFrame) {
            upperViaAnimationTimer = setTimeout(nextFrame, upperViaHoverFrameDelay);
          } else {
            upperViaAnimationTimer = null;
          }
        }

        upperViaAnimationTimer = setTimeout(nextFrame, upperViaHoverFrameDelay);
      }

      function playUpperViaPreClickAnimation(onDone) {
        stopUpperViaAnimation();

        let frameIndex = 0;
        upperViaImage.src = upperViaImagePath + upperViaPreClickFrames[frameIndex];

        function nextFrame() {
          frameIndex += 1;
          upperViaImage.src = upperViaImagePath + upperViaPreClickFrames[frameIndex];

          if (frameIndex < upperViaPreClickFrames.length - 1) {
            upperViaAnimationTimer = setTimeout(nextFrame, upperViaPreClickFrameDelay);
          } else {
            upperViaAnimationTimer = null;
            onDone();
          }
        }

        upperViaAnimationTimer = setTimeout(nextFrame, upperViaPreClickFrameDelay);
      }

      function playUpperViaClickAnimation() {
        stopUpperViaAnimation();
        upperViaMode = "clicked";

        upperViaRingoutSound.currentTime = 0;
        upperViaRingoutSound.play().catch(() => {});

        let clickFrame = 0;
        upperViaImage.src = upperViaImagePath + upperViaClickFrames[clickFrame];

        function nextClickFrame() {
          clickFrame = (clickFrame + 1) % upperViaClickFrames.length;
          upperViaImage.src = upperViaImagePath + upperViaClickFrames[clickFrame];
          upperViaAnimationTimer = setTimeout(nextClickFrame, upperViaClickFrameDelay);
        }

        upperViaAnimationTimer = setTimeout(nextClickFrame, upperViaClickFrameDelay);
      }

      upperVia.addEventListener("mouseenter", () => {
        if (upperViaMode !== "normal") {
          return;
        }

        upperViaCloseSound.currentTime = 0;
        upperViaCloseSound.play().catch(() => {});
        animateUpperViaHoverTo(upperViaHoverFrames.length - 1);
      });

      upperVia.addEventListener("mouseleave", () => {
        if (upperViaMode === "normal") {
          animateUpperViaHoverTo(0);
        }
      });

      upperVia.addEventListener("click", () => {
        if (upperViaMode === "normal") {
          upperViaMode = "clicked";
          playUpperViaPreClickAnimation(() => playUpperViaClickAnimation());
          return;
        }

        if (upperViaMode === "clicked") {
          stopUpperViaAnimation();
          upperViaMode = "normal";
          showUpperViaHoverFrame(upperViaHoverFrames.length - 1);
        }
      });

      preloadUpperViaImages();
    

      const viaHintButton = document.getElementById("via-hint-button");
      const viaHoverLabel = document.getElementById("via-hover-label");
      const viaClickPopup = document.getElementById("via-click-popup");

      const viaImagePath = "assets/img/ui/";
      const viaHoverFrames = ["point1.webp", "point2.webp"];
      const viaClickFrames = ["point-click1.webp", "point-click2.webp"];
      const viaFrameDelay = 200;

      const viaClickSound = createAudio("assets/sound/phased_b.wav");
      viaClickSound.preload = "auto";

      let viaTimer = null;
      let viaHasClicked = false;
      let viaPopupTimer = null;

      function clearViaTimer() {
        if (viaTimer !== null) {
          clearTimeout(viaTimer);
          viaTimer = null;
        }
      }

      function playViaSequence(frames, onDone) {
        clearViaTimer();
        let frameIndex = 0;
        function nextFrame() {
          viaHintButton.src = viaImagePath + frames[frameIndex];
          frameIndex += 1;
          if (frameIndex < frames.length) {
            viaTimer = setTimeout(nextFrame, viaFrameDelay);
          } else if (onDone) {
            onDone();
          }
        }
        nextFrame();
      }

      viaHintButton.addEventListener("mouseenter", () => {
        viaHasClicked = false;
        viaHoverLabel.hidden = false;
        playViaSequence(viaHoverFrames);
      });

      viaHintButton.addEventListener("mouseleave", () => {
        viaHoverLabel.hidden = true;
        if (viaHasClicked) {
          return;
        }
        const reversedFrames = [...viaHoverFrames].reverse();
        playViaSequence(reversedFrames, () => {
          viaHintButton.src = viaImagePath + "point.webp";
        });
      });

      viaHintButton.addEventListener("click", () => {
        viaHasClicked = true;
        viaClickSound.currentTime = 0;
        viaClickSound.play().catch(() => {});
        playViaSequence(viaClickFrames, () => {
          if (viaPopupTimer !== null) {
            clearTimeout(viaPopupTimer);
          }
          viaClickPopup.classList.add("is-visible");
          viaPopupTimer = setTimeout(() => {
            viaClickPopup.classList.remove("is-visible");
          }, 1000);

          viaTimer = setTimeout(() => {
            viaHintButton.src = viaImagePath + "point.webp";
            viaHasClicked = false;
          }, 500);
        });
      });
    

      const pointImagePath = "assets/img/ui/";
      const pointDefaultFrame = "point.webp";
      const pointHoverFrames = ["point1.webp", "point2.webp"];
      const pointClickFrames = ["point-click1.webp", "point-click2.webp"];
      const pointFrameDelay = 200;

      const ope2Sound = createAudio("assets/sound/ope2.wav");
      const phasedBSound = createAudio("assets/sound/phased_b.wav");
      ope2Sound.preload = "auto";
      phasedBSound.preload = "auto";

      const genericClickPopup = document.getElementById("generic-click-popup");
      let genericPopupTimer = null;

      function showGenericClickPopup() {
        if (genericPopupTimer !== null) {
          clearTimeout(genericPopupTimer);
        }
        genericClickPopup.classList.add("is-visible");
        genericPopupTimer = setTimeout(() => {
          genericClickPopup.classList.remove("is-visible");
        }, 1000);
      }

      function setupPointButton(img) {
        let timer = null;
        let hasClicked = false;

        function clearTimer() {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        }

        function playSequenceOnce(frames, sound, onDone) {
          clearTimer();
          if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
          }

          let frameIndex = 0;
          function nextFrame() {
            img.src = pointImagePath + frames[frameIndex];
            frameIndex += 1;
            if (frameIndex < frames.length) {
              timer = setTimeout(nextFrame, pointFrameDelay);
            } else if (onDone) {
              onDone();
            }
          }
          nextFrame();
        }

        img.addEventListener("mouseenter", () => {
          hasClicked = false;
          playSequenceOnce(pointHoverFrames, ope2Sound);
        });

        img.addEventListener("mouseleave", () => {
          if (hasClicked) {
            return;
          }
          const reversedFrames = [...pointHoverFrames].reverse();
          playSequenceOnce(reversedFrames, null, () => {
            img.src = pointImagePath + pointDefaultFrame;
          });
        });

        img.addEventListener("click", () => {
          hasClicked = true;
          showGenericClickPopup();
          playSequenceOnce(pointClickFrames, phasedBSound, () => {
            timer = setTimeout(() => {
              img.src = pointImagePath + pointDefaultFrame;
              hasClicked = false;
            }, 500);
          });
        });
      }

      document.querySelectorAll(".point-button").forEach(setupPointButton);
    

      const sideImagePath = "assets/img/ui/";
      const sideFrameDelay = 150;

      const digiSprSound = createAudio("assets/sound/digi_spr.wav");
      const twingySound = createAudio("assets/sound/twingy.wav");
      digiSprSound.preload = "auto";
      twingySound.preload = "auto";

      function setupSideButton(img) {
        let timer = null;
        let state = "idle";

        function clearTimer() {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        }

        function playOpen() {
          clearTimer();
          const base = img.dataset.base;
          const openFrames = [base + "1.webp", base + "2.webp"];
          state = "opening";
          img.style.opacity = "1";
          digiSprSound.currentTime = 0;
          digiSprSound.play().catch(() => {});

          let frameIndex = 0;
          img.src = sideImagePath + openFrames[frameIndex];

          function nextFrame() {
            frameIndex += 1;
            if (frameIndex < openFrames.length) {
              img.src = sideImagePath + openFrames[frameIndex];
              timer = setTimeout(nextFrame, sideFrameDelay);
            } else {
              state = "open";
            }
          }
          timer = setTimeout(nextFrame, sideFrameDelay);
        }

        function playClose() {
          clearTimer();
          const base = img.dataset.base;
          const closeFrames = [base + "2.webp", base + "1.webp"];
          state = "closing";

          let frameIndex = 0;
          img.src = sideImagePath + closeFrames[frameIndex];

          function nextFrame() {
            frameIndex += 1;
            if (frameIndex < closeFrames.length) {
              img.src = sideImagePath + closeFrames[frameIndex];
              timer = setTimeout(nextFrame, sideFrameDelay);
            } else {
              img.style.opacity = "0";
              state = "idle";
            }
          }
          timer = setTimeout(nextFrame, sideFrameDelay);
        }

        function playClick() {
          clearTimer();
          const base = img.dataset.base;
          const clickFrame = base + "3.webp";
          state = "clicked";
          img.style.opacity = "1";
          twingySound.currentTime = 0;
          twingySound.play().catch(() => {});
          img.src = sideImagePath + clickFrame;

          if (typeof sideNavTargets !== "undefined" && sideNavTargets[base]) {
            showPage(sideNavTargets[base]);
          }

          timer = setTimeout(() => {
            img.style.opacity = "0";
            state = "idle";
          }, 500);
        }

        img.addEventListener("mouseenter", () => {
          if (state === "clicked") {
            return;
          }
          playOpen();
        });

        img.addEventListener("mouseleave", () => {
          if (state === "clicked") {
            return;
          }
          playClose();
        });

        img.addEventListener("click", () => {
          playClick();
        });
      }

      const sideNavTargets = {
        "s-menu": "page-main",
        "s-demo": "page-upravdem",
        "s-patches": "page-patches",
        "s-util": "page-util",
        "s-share": "page-share",
        "s-bonus": "page-bonus",
        "s-exe": "page-via",
      };

      document.querySelectorAll(".side-button").forEach(setupSideButton);
    

      const SPLASH_SESSION_KEY = "game-exe-1998-08-splash";
      const splashEl = document.getElementById("splash");
      const appUiEl = document.getElementById("app-ui");
      const splashUpperEl = document.getElementById("splash-upper-el");
      const splashLeftEl = document.getElementById("splash-left-el");
      const splashText1 = document.getElementById("splash-text1");
      const splashText2 = document.getElementById("splash-text2");

      function revealAppUi() {
        splashEl.hidden = true;
        appUiEl.hidden = false;
      }

      function playSplashSequence() {
        appUiEl.hidden = true;
        splashEl.hidden = false;
        splashEl.removeEventListener("click", revealAppUi);

        splashUpperEl.classList.remove("is-in");
        splashLeftEl.classList.remove("is-in");
        splashText1.classList.remove("is-in");
        splashText2.classList.remove("is-in");
        // форсируем reflow, чтобы сброс классов применился до повторного запуска transitionend-цепочки
        void splashEl.offsetWidth;

        const bugleSound = createAudio("assets/sound/bugle_ca.opus");
        bugleSound.play().catch(() => {});

        function splashStep1() {
          splashUpperEl.addEventListener("transitionend", splashStep2, { once: true });
          splashUpperEl.classList.add("is-in");
        }

        function splashStep2() {
          splashLeftEl.addEventListener("transitionend", splashStep3, { once: true });
          splashLeftEl.classList.add("is-in");
        }

        function splashStep3() {
          splashText1.addEventListener("transitionend", splashStep4, { once: true });
          splashText1.classList.add("is-in");
        }

        function splashStep4() {
          splashText2.addEventListener("transitionend", splashSequenceDone, { once: true });
          splashText2.classList.add("is-in");
        }

        function splashSequenceDone() {
          splashEl.addEventListener("click", revealAppUi, { once: true });
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(splashStep1);
        });
      }

      if (sessionStorage.getItem(SPLASH_SESSION_KEY)) {
        revealAppUi();
      } else {
        sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
        playSplashSequence();
      }
    

      const videoModal = document.getElementById("video-modal");
      const videoModalFrame = document.getElementById("video-modal-frame");

      function openVideoModal(src) {
        videoModalFrame.innerHTML =
          '<iframe src="' +
          src +
          '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" referrerpolicy="no-referrer" allowfullscreen></iframe>';
        videoModal.hidden = false;
      }

      function closeVideoModal() {
        videoModal.hidden = true;
        videoModalFrame.innerHTML = "";
      }

      videoModal.addEventListener("click", closeVideoModal);

      document.querySelectorAll("[data-video-src]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openVideoModal(btn.dataset.videoSrc);
        });
      });
    

      const descriptionPages = {
        "page-upravdem": "list",
        "page-patches": "list",
        "page-util": "list",
        "page-share": "list",
        "page-bonus": "single",
      };

      fetch("assets/data/descriptions.json")
        .then((response) => response.json())
        .then((data) => {
          Object.keys(descriptionPages).forEach((pageId) => {
            const mode = descriptionPages[pageId];
            const pageEl = document.getElementById(pageId);
            const textEl = document.getElementById(
              "bottom-text-" + pageId.replace("page-", "")
            );
            if (!pageEl || !textEl) {
              return;
            }

            if (mode === "single") {
              const text = data[pageId] || "";
              pageEl.querySelectorAll(".point-button").forEach((btn) => {
                btn.addEventListener("mouseenter", () => {
                  textEl.textContent = text;
                  textEl.scrollTop = 0;
                });
              });
              return;
            }

            const texts = data[pageId] || [];
            const buttons = pageEl.querySelectorAll(".point-button");
            buttons.forEach((btn, index) => {
              if (texts[index]) {
                btn.addEventListener("mouseenter", () => {
                  textEl.textContent = texts[index];
                  textEl.scrollTop = 0;
                });
              }
            });
          });
        })
        .catch(() => {});
    