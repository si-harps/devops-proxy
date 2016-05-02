VERSION=$(shell git rev-parse --short HEAD)
DOCKER_REPO=renegare
APP_NAME=devops-proxy

build:
	echo $(VERSION) > VERSION
	docker build -t $(DOCKER_REPO)/$(APP_NAME):latest .
	docker tag $(DOCKER_REPO)/$(APP_NAME):latest $(DOCKER_REPO)/$(APP_NAME):$(VERSION)
	-docker ps -qaf status=exited | xargs docker rm
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
