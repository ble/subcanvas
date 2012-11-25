
PLOVR=java -jar plovr.jar 
SRCS=$(wildcard ../config/*.json)

serve :
	$(PLOVR) serve $(SRCS)
build-ui:
	mkdir -p ./product
	$(PLOVR) build ../config/ui.json > ./product/ui.js
