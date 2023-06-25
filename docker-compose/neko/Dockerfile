FROM codeurs/mod-neko
RUN echo "deb http://archive.debian.org/debian/ jessie main" > /etc/apt/sources.list
RUN echo "deb-src http://archive.debian.org/debian/ jessie main" >> /etc/apt/sources.list
RUN apt-get update
RUN sed -i 's!/var/www/html!/var/www/www!g' /etc/apache2/sites-available/000-default.conf
RUN service apache2 restart
RUN apt-get update
RUN apt-get -y --force-yes install curl
RUN haxelib setup /usr/share/haxelib
RUN haxelib install -notimeout templo
RUN cd /usr/bin && haxelib run templo
