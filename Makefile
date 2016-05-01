VERSION=$(shell git rev-parse --short HEAD)
DOCKER_REPO=renegare
APP_NAME=devopsproxy


build:
	echo $(VERSION) > VERSION
	docker-compose build app
	docker-compose build app
	docker-compose -p $(APP_NAME)$(VERSION) build app
	docker tag $(APP_NAME)$(VERSION)_app $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
	docker tag $(APP_NAME)$(VERSION)_app $(DOCKER_REPO)/$(APP_NAME):latest
	-docker ps -aqf status=exited | xargs docker rm
	-docker rmi $(APP_NAME)$(VERSION)_app
	-docker images -qaf dangling=true | xargs docker rmi
	docker images | grep $(DOCKER_REPO)/$(APP_NAME)

push:
	docker push $(DOCKER_REPO)/$(APP_NAME):latest
	docker push $(DOCKER_REPO)/$(APP_NAME):$(VERSION)

update-webservices-ip:
	docker inspect devopsproxy_webservices_1 | grep IPAddress
	docker-compose stop webservices
	docker-compose rm -f
	docker-compose up -d webservices
	docker inspect devopsproxy_webservices_1 | grep IPAddress
