# Requires tsc and SASS
# Both can be installed with npm

all: javascript styles.css

.PHONY: clean

javascript: sweeper.ts http-get.ts leaders.ts
	tsc --build tsconfig.json

# Definitely just use the javascript target instead of these next three
sweeper.js: sweeper.ts http-get.js leaders.js
	tsc sweeper.ts

http-get.js: http-get.ts
	tsc http-get.ts

leaders.js: leaders.ts
	tsc leaders.ts

styles.css: styles.scss
	sass styles.scss styles.css