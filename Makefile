
.PHONY: run

COFFEE_FILES = addon-sdk/packages/addon-kit/lib/notification-box.cs hackerite/lib/main.cs

JS_FILES = $(addsuffix .js, $(basename $(COFFEE_FILES)))

%.js: %.coffee
	coffee -c $?

run: $(JS_FILES)
	cd hackerite && cfx run -p x

xpi: $(JS_FILES)
	cd hackerite && cfx xpi
