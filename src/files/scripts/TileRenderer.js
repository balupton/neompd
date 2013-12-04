/*global define */

"use strict";

var $ = require('../vendor/jquery/jquery.js');


    function TileRenderer(tile, app, renderer) {
        this.app = app;
        this.tile = tile;
        this.renderer = renderer;

        this.$li = $('<li></li>').appendTo(this.renderer.$grid);

        this.isArticleMode = (this.app.currentArticle ? true : false);

        this.isRevealed = false;

        this.isDismissing = false;
        this.isDoneDismissing = false;
        this.isBelowMiddle = false;

        this.renderedTransform = null;
        this.renderedOpacity = null;
        this.renderedTransition = false;
        this.renderedNoEvents = false;
        this.count = 0;

        this.lastPositionTransform = null;

        this.$li.html(this.tile.html);
        this.$li.css({
            position: 'absolute',
            opacity: this.renderer.MIN_OPACITY,
            top: 0,
            left: 0
        });

        if (this.isArticleMode) {
            this.initializeArticleModeState();
        } else {
            this.isRevealed = this.getVisibility();
            this.isBelowMiddle = this.getBelowMiddle();
        }
        this.renderTile();

        $(this.tile).on('moved', this.onMoved.bind(this));
        $(this.app).on('navigated', this.onNavigated.bind(this));
        $(this.renderer).on('viewport', this.onViewport.bind(this));
        $(this.renderer).on('scrollBackChanged', this.onScrollBackChanged.bind(this));
    }

    TileRenderer.prototype.renderTile = function () {
        var animationAmount = Math.abs(this.renderer.articleScrollBackAmount),
            verticalOffset = (this.isArticleMode && this.isDismissing) ?
                (this.isBelowMiddle ? 1 : -1) * (this.isDoneDismissing ? Math.round((1 - animationAmount) * 650) : 650) :
                (!this.isArticleMode && !this.isRevealed ? (this.isBelowMiddle ? 1 : -1) * 210 : 0),

            positionTransform = this.tile.x === null ? null : 'translate3d(' + this.tile.x + 'px,' + Math.max(this.tile.y + verticalOffset, -70) + 'px,0)',

            tileNoEvents = this.isArticleMode,
            tileFixed = (this.isArticleMode && this.isDismissing),
            tileOpacity = this.isRevealed ? 0.999 : 0.001,
            tileTransform = positionTransform === null ?
                (this.lastPositionTransform || 'translate3d(0,0,0)') + ' scale(0.001)' :
                positionTransform,
            tileTransition = this.isArticleMode ? (this.isDismissing && !this.isDoneDismissing) : this.isRevealed;

        // remember last known position
        if (positionTransform !== null) {
            this.lastPositionTransform = positionTransform;
        }

        // update transitioning first
        if (positionTransform !== null && this.renderedTransition !== tileTransition) {
            this.$li.css({
                transition: (this.renderedTransition = tileTransition) ?
                    '-webkit-transform 0.425s ease-out 0.05s, opacity 0.625s ease-in 0.075s' :
                    'none'
            });
        }

        //prevent scroll jank by moving 'filtered' tiles off of the screen
        if(positionTransform === null && ! this.isHidden) {
            this.$li.css('top', -this.tile.height);
            this.isHidden = true;
        } else if(this.isHidden) {
            this.$li.css('top', 0);
            this.isHidden = false;
        }

        if (this.renderedNoEvents !== tileNoEvents) {
            this.$li.css({
                'pointer-events': (this.renderedNoEvents = tileNoEvents) ? 'none' : 'auto'
            });
        }

        if (this.renderedTransform !== tileTransform) {
            this.$li.css({
                transform: this.renderedTransform = tileTransform
            });
        }
        if (this.renderedOpacity !== tileOpacity) {
            this.$li.css({
                opacity: this.renderedOpacity = tileOpacity
            });
        }
    };

    TileRenderer.prototype.getVisibility = function () {
        // check for filtered tile
        if (this.tile.x === null) {
            return false;
        }

        return (this.tile.y + this.tile.height > this.renderer.gridViewport.revealedTop && this.tile.y < this.renderer.gridViewport.revealedBottom);
    };

    TileRenderer.prototype.getBelowMiddle = function() {
        return this.tile.y > (this.renderer.gridViewport.top + this.renderer.gridViewport.bottom) * 0.5;
    };

    TileRenderer.prototype.requestPendingReveal = function () {
        if (this.incompleteRevealCallback) {
            return;
        }
        // ask for delayed reveal
        this.incompleteRevealCallback = function () {
            // mark as invoked
            this.incompleteRevealCallback = null;

            // fail-fast check for missed cleanup
            if (this.isArticleMode || this.isRevealed) {
                throw 'cannot reveal';
            }
            this.isRevealed = true;
            this.renderTile();
        }.bind(this);

        this.renderer.queue.add(this.incompleteRevealCallback);
    };

    TileRenderer.prototype.cancelPendingReveal = function () {
        // fail-fast check for missed cleanup
        if (this.isArticleMode || this.isRevealed) {
            throw 'cannot cancel reveal';
        }

        if (!this.incompleteRevealCallback) {
            return;
        }

        // cancel delayed reveal
        this.renderer.queue.remove(this.incompleteRevealCallback);
        this.incompleteRevealCallback = null;
    };

    TileRenderer.prototype.initializeArticleModeState = function () {
        if (this.getVisibility()) {
            this.isDismissing = true;
            this.isDoneDismissing = false;
            this.isBelowMiddle = this.getBelowMiddle();
        } else {
            this.isDismissing = false;
        }
    };

    TileRenderer.prototype.onMoved = function () {
        this.renderTile();

        if (!this.isArticleMode && !this.isRevealed) {
            if (this.getVisibility()) {
                this.requestPendingReveal();
            } else {
                this.cancelPendingReveal();
            }
        }
    };

    TileRenderer.prototype.onNavigated = function (e, isViaLinkClick) {
        if (!this.app.currentArticle) {
            if (!this.isRevealed && !this.isArticleMode) {
                this.cancelPendingReveal();
            }
            this.isArticleMode = false;
            this.isRevealed = this.getVisibility();
            this.isBelowMiddle = this.getBelowMiddle();
        } else if (!this.isArticleMode && this.app.currentArticle) {
            if (!this.isRevealed) {
                this.cancelPendingReveal();
            }

            this.isArticleMode = true;
            this.initializeArticleModeState();

        }
        this.renderTile();

    };

    TileRenderer.prototype.onViewport = function (e) {
        if (this.isArticleMode) {
            throw 'cannot change viewport in article mode';
        }
        if (!this.isRevealed) {
            if (this.getVisibility()) {
                this.requestPendingReveal();
            } else {
                this.cancelPendingReveal();
            }
        }
    };

    TileRenderer.prototype.onScrollBackChanged = function () {
        if (!this.isArticleMode) {
            throw 'cannot scroll back outside of article mode';
        }

        this.isDoneDismissing = true;

        this.renderTile();
    };

module.exports = TileRenderer;
