FROM httpd:2.4
LABEL maintainer = "Andre Schnitker <Andre.Schnitker@lmis.de>"
ENV STI_SCRIPTS_PATH=/usr/libexec/s2i \
    SOURCE_DIR=/opt/application

LABEL io.k8s.description="Builder image for the agrigaia UI application" \
      io.k8s.display-name="ag-platform-ui-frontend-builder" \
      io.openshift.s2i.scripts-url=image://${STI_SCRIPTS_PATH}



RUN adduser --disabled-login -u 1001 test && apt update && apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs

COPY ./s2i/bin/ ${STI_SCRIPTS_PATH}

RUN mkdir -p $SOURCE_DIR \
      && chmod 0777 $SOURCE_DIR \
      && chmod -R 0777 /usr/local/apache2/htdocs \
      && chmod 755 ${STI_SCRIPTS_PATH}/* \
      && chmod 755 /tmp/

# Drop root (as is tradition)
USER 1001

CMD ["/usr/libexec/s2i/usage"]
