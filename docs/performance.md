# Performance constraints

This shell is designed for weak Linux kiosk hardware.

Guidelines:

- prefer static files;
- avoid browser network fetch loops;
- keep DOM bounded;
- avoid expensive animations;
- use CSS transforms and simple layout;
- update data by replacing a local JS snapshot file;
- validate layout before deploying to a production display.
