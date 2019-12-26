build:
	bash build-deb.sh

install:
	cd build && dpkg -i localproxy*.deb

clean:
	rm -rf build

.PHONY: clean install build