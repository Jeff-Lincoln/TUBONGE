import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.24"
    id("java-gradle-plugin")

    // Add the Google services Gradle plugin
    id("com.google.gms.google-services") version "4.4.2" apply false

    // Add the Android application plugin
    id("com.android.application")

    // Apply the Google services Gradle plugin
    id("com.google.gms.google-services")
}

repositories {
    mavenCentral()
}

gradlePlugin {
    plugins {
        create("reactSettingsPlugin") {
            id = "com.facebook.react.settings"
            implementationClass = "expo.plugins.ReactSettingsPlugin"
        }
    }
}

dependencies {
    // Import the Firebase BoM (Bill of Materials)
    implementation(platform("com.google.firebase:firebase-bom:33.4.0"))

    // Firebase Analytics dependency
    implementation("com.google.firebase:firebase-analytics")

    // Add the dependencies for any other desired Firebase products
    // When using the BoM, don't specify versions in Firebase dependencies
    // Check https://firebase.google.com/docs/android/setup#available-libraries for more libraries
}
