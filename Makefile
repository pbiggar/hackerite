
.PHONY: run

COFFEE_FILES = addon-sdk/packages/addon-kit/lib/notification-box.coffee hackerite/lib/main.coffee hackerite/lib/blacklist.coffee

JS_FILES = $(addsuffix .js, $(basename $(COFFEE_FILES)))

%.js: %.coffee
	coffee -c $?

run: $(JS_FILES)
	cd hackerite && cfx run -p x

xpi: $(JS_FILES)
	cd hackerite && cfx xpi
